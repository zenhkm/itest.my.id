import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { AppContext } from '../context/AppContext';
import { Activity, User, Clock, FileText, Zap } from 'lucide-react';
import './LiveRecord.css';
import toast from 'react-hot-toast';

const formatTimeLeft = (sec) => {
  if (sec === null || sec === undefined) return '-';
  if (isNaN(Number(sec))) return String(sec);
  const s = Math.max(0, Number(sec));
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

const LiveRecord = () => {
  const { exams = [], students = [], user, showConfirm } = useContext(AppContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!exams || exams.length === 0) {
        setSessions([]);
        return;
      }
      setLoading(true);
      try {
        const examIds = exams.map(e => e.id).filter(Boolean);
        if (examIds.length === 0) return setSessions([]);

        const { data, error } = await supabase
          .from('exam_sessions')
          .select('*')
          .in('exam_id', examIds);

        if (error) {
          console.error('Error fetching exam_sessions:', error);
        } else if (mounted) {
          const mapped = (data || []).map(s => ({ ...s, examTitle: exams.find(e => e.id === s.exam_id)?.title || s.exam_id }));
          setSessions(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [exams]);

  useEffect(() => {
    if (!exams || exams.length === 0) return;
    const examIds = exams.map(e => e.id).filter(Boolean);
    if (examIds.length === 0) return;

    const channel = supabase
      .channel('public:exam_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_sessions' }, (payload) => {
        const rec = payload?.new || payload?.record || payload;
        if (!rec) return;
        if (!examIds.includes(rec.exam_id)) return; // ignore unrelated exams

        const key = `${rec.exam_id}::${rec.student_nis}`;

        // DELETE events may provide payload.old or similar
        const isDelete = (payload.eventType && payload.eventType.toLowerCase() === 'delete') || (payload.type && String(payload.type).toLowerCase() === 'delete') || (payload.event && String(payload.event).toLowerCase() === 'delete');

        setSessions(prev => {
          const idx = prev.findIndex(s => `${s.exam_id}::${s.student_nis}` === key);
          if (isDelete) {
            if (idx === -1) return prev;
            const copy = [...prev];
            copy.splice(idx, 1);
            return copy;
          }

          const newItem = { ...rec, examTitle: exams.find(e => e.id === rec.exam_id)?.title || rec.exam_id };
          if (idx === -1) return [newItem, ...prev];
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...newItem };
          return copy;
        });
      })
      .subscribe();

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch (err) {
        // fallback
        try { channel.unsubscribe(); } catch (e) { /* ignore */ }
      }
    };
  }, [exams]);

  const forceEnd = async (sess) => {
    if (!sess) return;
    const confirmed = await (showConfirm
      ? showConfirm('Paksa Akhiri Sesi', `Paksa akhiri sesi ${sess.student_nis} pada "${sess.examTitle}"? Jawaban siswa akan dikumpulkan otomatis.`, 'Akhiri')
      : Promise.resolve(window.confirm(`Paksa akhiri sesi ${sess.student_nis} pada ${sess.examTitle}?`)));
    if (!confirmed) return;

    try {
      // 1. Kirim sinyal broadcast ke halaman Exam siswa (agar siswa submit jawaban secara real-time)
      const channelName = `force-end-${sess.student_nis}-${sess.exam_id}`;
      const bc = supabase.channel(channelName);
      bc.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          bc.send({ type: 'broadcast', event: 'force-end', payload: {} }).finally(() => {
            setTimeout(() => { try { supabase.removeChannel(bc); } catch (e) { /* ignore */ } }, 3000);
          });
        }
      });

      // 2. Hapus sesi dari database
      const { error } = await supabase
        .from('exam_sessions')
        .delete()
        .eq('student_nis', sess.student_nis)
        .eq('exam_id', sess.exam_id);

      if (error) {
        toast.error('Gagal menghapus sesi.');
        console.error(error);
      } else {
        setSessions(prev => prev.filter(s => !(s.student_nis === sess.student_nis && s.exam_id === sess.exam_id)));
        toast.success(`Sinyal force-end dikirim ke ${sess.student_nis}. Jawaban akan dikumpulkan di sisi siswa.`);
      }
    } catch (err) {
      console.error('Error forceEnd:', err);
      toast.error('Terjadi kesalahan saat memproses force-end.');
    }
  };

  return (
    <div className="live-record">
      <div className="view-header">
        <h1><Activity size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Live Record</h1>
        <p>Memantau sesi ujian yang sedang berlangsung secara real-time.</p>
      </div>

      <div className="live-meta">
        <div className="meta-item">Total Sesi: <strong>{sessions.length}</strong></div>
        <div className="meta-item">Ujian Aktif: <strong>{new Set(sessions.map(s => s.exam_id)).size}</strong></div>
      </div>

      <div className="live-table-wrap">
        {loading ? (
          <div className="live-loading">Memuat sesi...</div>
        ) : (
          <table className="live-table">
            <thead>
              <tr>
                <th>Ujian</th>
                <th>NIS</th>
                <th>Nama</th>
                <th>Time Left</th>
                <th>Soal Ke</th>
                <th>Terakhir Update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '18px', color: 'var(--text-muted)' }}>Tidak ada sesi ujian aktif saat ini.</td>
                </tr>
              )}

              {sessions.map((s, i) => (
                <tr key={`${s.exam_id}-${s.student_nis}-${i}`}>
                  <td style={{ minWidth: 220 }}>{s.examTitle}</td>
                  <td>{s.student_nis}</td>
                  <td>{(students.find(st => String(st.nis) === String(s.student_nis)) || {}).name || '-'}</td>
                  <td>{formatTimeLeft(s.time_left)}</td>
                  <td>{s.current_idx ?? '-'}</td>
                  <td>{s.updated_at ? new Date(s.updated_at).toLocaleString('id-ID') : '-'}</td>
                  <td>
                    <button className="btn-force" onClick={() => forceEnd(s)}>Force End</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LiveRecord;
