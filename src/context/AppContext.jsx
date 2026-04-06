import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';

// Simpan hash sesaat sebelum terhapus oleh React Router (Navigate component)
const initialHash = typeof window !== 'undefined' ? window.location.hash : '';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const loadUser = () => {
    const saved = localStorage.getItem('web_ujian_user');
    return saved ? JSON.parse(saved) : null;
  };

  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [students, setStudents] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(loadUser);
  const [isFetching, setIsFetching] = useState(true);

  // Sync auth state to local storage (Mock Auth persistence)
  useEffect(() => {
    if (user) {
      localStorage.setItem('web_ujian_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('web_ujian_user');
    }
  }, [user]);

  // Handle Supabase Auth (Email Confirmation Redirects)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Jika ada hash panjang di URL saat awal load akibat redirect konfirmasi email
        if (initialHash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname);
          toast.success('Email berhasil diverifikasi! Anda telah login secara otomatis.');
        }

        const supUser = session.user;
        if (supUser && !user) {
          const role = supUser.user_metadata?.role || 'admin';
          const name = supUser.user_metadata?.name || 'Administrator';
          const username = supUser.user_metadata?.username || supUser.email;
          const admin_id = supUser.user_metadata?.admin_id || supUser.email;

          setUser({ username, name, role, admin_id });
          fetchHistory({ username, name, role, admin_id });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setHistory([]);
      }
    });

    // Tangkap kode Error di URL (menggunakan initialHash yang belum terhapus)
    if (initialHash.includes('error=')) {
      const urlParams = new URLSearchParams(initialHash.substring(1));
      const errorDesc = urlParams.get('error_description');
      if (errorDesc) {
        toast.error('Gagal Verifikasi: ' + errorDesc.replace(/\+/g, ' '));
      } else {
        toast.error('Token verifikasi tidak valid atau telah kadaluarsa. Silakan mendaftar ulang.');
      }
      window.history.replaceState(null, '', window.location.pathname);
    }

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const showConfirm = async (title, text, confirmTarget = 'Ya') => {
    const result = await Swal.fire({
      title: title || 'Konfirmasi Tindakan',
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: confirmTarget,
      cancelButtonText: 'Batal',
      background: 'rgba(30, 41, 59, 1)',
      color: '#fff',
      customClass: {
        popup: 'glass-panel'
      }
    });
    return result.isConfirmed;
  };

  // Auth Actions
  const login = (userData) => {
    setUser(userData);
    fetchHistory(userData);
  };

  const logout = async () => {
    // 1. Bersihkan sesi internal aplikasi
    setUser(null);
    setHistory([]);
    localStorage.removeItem('web_ujian_user');
    
    // 2. Bersihkan sesi resmi di memori Supabase agar tidak auto-terbaca setelah refresh
    await supabase.auth.signOut();
  };

  // Exam Auto-Save Methods
  const fetchExamSession = async (examId) => {
    if (!user || user.role !== 'student') return null;
    
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .eq('student_nis', user.username)
      .eq('exam_id', examId)
      .single();
      
    if (error) {
      if (error.code !== 'PGRST116') { // not found error
        console.error('Error fetching exam session:', error);
      }
      return null;
    }
    return data;
  };

  const upsertExamSession = async (sessionData) => {
    if (!user || user.role !== 'student') return;

    const payload = {
      student_nis: user.username,
      exam_id: sessionData.examId,
      answers: sessionData.answers,
      flagged: sessionData.flagged,
      time_left: sessionData.timeLeft,
      current_idx: sessionData.currentIdx,
      shuffled_questions: sessionData.shuffledQuestions,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('exam_sessions')
      .upsert(payload, { onConflict: 'student_nis, exam_id' });

    if (error) {
      console.error('Error auto-saving session:', error);
    }
  };

  const deleteExamSession = async (examId) => {
    if (!user || user.role !== 'student') return;

    const { error } = await supabase
      .from('exam_sessions')
      .delete()
      .eq('student_nis', user.username)
      .eq('exam_id', examId);
      
    if (error) {
      console.error('Error deleting exam session:', error);
    }
  };

  // Fetch Data from Supabase
  useEffect(() => {
    let isMounted = true;
    if (user && user.admin_id) {
      const initializeData = async () => {
        setIsFetching(true);
        await Promise.all([fetchExams(user), fetchHistory(user), fetchStudents(user), fetchStaff(user), fetchQuestions(user), fetchSchools(user), fetchRooms(user)]);
        if (isMounted) {
          setIsFetching(false);
        }
      };
      initializeData();
    } else {
      setExams([]); setHistory([]); setStudents([]); setStaffList([]); setQuestions([]); setSchools([]); setRooms([]);
      setIsFetching(false);
    }

    return () => { isMounted = false; };
  }, [user?.admin_id]);

  const fetchExams = async (currentUser = user) => {
    if (!currentUser || !currentUser.admin_id) return;
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('admin_id', currentUser.admin_id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching exams:', error);
      toast.error('Gagal mengambil data ujian dari database.');
    } else {
      setExams(data || []);
    }
  };

  const fetchHistory = async (currentUser = user) => {
    if (!currentUser || !currentUser.admin_id) return;

    let query = supabase
      .from('history')
      .select('*')
      .eq('admin_id', currentUser.admin_id)
      .order('date', { ascending: false });
      
    if (currentUser.role === 'student') {
      query = query.eq('studentname', currentUser.name); // Filter strict khusus untuk nama ia sendiri
    }

    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching history:', error);
      toast.error('Gagal mengambil data riwayat.');
    } else {
      const mappedData = (data || []).map(row => ({
        id: row.id,
        examId: row.examid,
        examTitle: row.examtitle,
        subject: row.subject,
        score: row.score,
        totalQuestions: row.totalquestions,
        correctAnswers: row.correctanswers,
        status: row.status,
        date: row.date,
        studentName: row.studentname,
        details_snapshot: row.details_snapshot
      }));
      setHistory(mappedData);
    }
  };

  const fetchStudents = async (currentUser = user) => {
    if (!currentUser || !currentUser.admin_id) return;
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('admin_id', currentUser.admin_id)
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching students:', error);
      toast.error('Gagal mengambil data siswa riwayat.');
    } else {
      setStudents(data || []);
    }
  };

  const fetchStaff = async (currentUser = user) => {
    if (!currentUser || !currentUser.admin_id) return;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('admin_id', currentUser.admin_id)
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching staff:', error);
      toast.error('Gagal mengambil data rekam jejak pegawai internal.');
    } else {
      setStaffList(data || []);
    }
  };

  const fetchQuestions = async (currentUser = user) => {
    if (!currentUser || !currentUser.admin_id) return;
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('admin_id', currentUser.admin_id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      const mapped = (data || []).map(q => ({
        ...q,
        imageUrl: q.imageurl || q.imageUrl,
        optionImages: q.optionimages || q.optionImages || [],
        correctOption: q.correctoption !== undefined ? q.correctoption : q.correctOption
      }));
      setQuestions(mapped);
    }
  };

  const fetchSchools = async (currentUser = user) => {
    if (!currentUser || !currentUser.admin_id) return;
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('admin_id', currentUser.admin_id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching schools:', error);
      toast.error('Gagal mengambil data master sekolah.');
    } else {
      setSchools(data || []);
    }
  };

  const addSchool = async (newSchool) => {
    const loadingToast = toast.loading('Menambahkan instansi sekolah baru...');
    const { error } = await supabase.from('schools').insert([{
      npsn: newSchool.npsn,
      name: newSchool.name,
      address: newSchool.address,
      principal: newSchool.principal,
      phone: newSchool.phone,
      status: newSchool.status || 'Aktif'
    }]);
    
    if (error) {
      console.error('Error adding school:', error);
      if (error.code === '23505') { 
         toast.error('NPSN tersebut sudah terdaftar!', { id: loadingToast });
      } else {
         toast.error('Gagal menambahkan instansi ke database.', { id: loadingToast });
      }
      return false;
    } else {
      await fetchSchools(); // simple refresh
      toast.success('Instansi sekolah berhasil didaftarkan!', { id: loadingToast });
      return true;
    }
  };

  const updateSchool = async (id, updates) => {
    const loadingToast = toast.loading('Memperbarui data sekolah...');
    const { error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating school:', error);
      toast.error('Gagal memperbarui konfigurasi sekolah.', { id: loadingToast });
      return false;
    } else {
      setSchools((prev) => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('Profil sekolah berhasil diperbarui di Cloud!', { id: loadingToast });
      return true;
    }
  };

  const deleteSchool = async (id) => {
    if (await showConfirm('Cabut Instansi', 'Yakin ingin mencabut & menghapus riwayat instansi sekolah ini dari database?')) {
      const loadingToast = toast.loading('Menghapus sekolah...');
      const { error } = await supabase.from('schools').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting school:', error);
        toast.error('Gagal menghapus instansi dari server.', { id: loadingToast });
      } else {
        setSchools((prev) => prev.filter(s => s.id !== id));
        toast.success('Instansi berhasil dicabut secara permanen.', { id: loadingToast });
      }
    }
  };

  const fetchRooms = async (currentUser = user) => {
    if (!currentUser || !currentUser.admin_id) return;
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('admin_id', currentUser.admin_id)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Gagal mengambil data ruangan.');
    } else {
      setRooms(data || []);
    }
  };

  const addRoom = async (newRoom) => {
    const loadingToast = toast.loading('Menambahkan daftar ruangan baru...');
    const { error } = await supabase.from('rooms').insert([{
      room_code: newRoom.room_code,
      room_name: newRoom.room_name,
      capacity: newRoom.capacity,
      status: newRoom.status || 'Tersedia',
      admin_id: user.admin_id
    }]);
    
    if (error) {
      console.error('Error adding room:', error);
      if (error.code === '23505') { 
         toast.error('Kode Ruangan tersebut sudah terdaftar!', { id: loadingToast });
      } else {
         toast.error('Gagal menambahkan ruangan ke database.', { id: loadingToast });
      }
      return false;
    } else {
      await fetchRooms();
      toast.success('Ruangan berhasil didaftarkan!', { id: loadingToast });
      return true;
    }
  };

  const updateRoom = async (id, updates) => {
    const loadingToast = toast.loading('Memperbarui data ruangan...');
    const { error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating room:', error);
      toast.error('Gagal memperbarui konfigurasi ruangan.', { id: loadingToast });
      return false;
    } else {
      setRooms((prev) => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      toast.success('Profil ruangan berhasi diperbarui!', { id: loadingToast });
      return true;
    }
  };

  const deleteRoom = async (id) => {
    if (await showConfirm('Hapus Ruangan', 'Yakin ingin menghapus ruangan ujian ini?')) {
      const loadingToast = toast.loading('Menghapus ruangan...');
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting room:', error);
        toast.error('Gagal menghapus ruangan.', { id: loadingToast });
      } else {
        setRooms((prev) => prev.filter(r => r.id !== id));
        toast.success('Ruangan dihapus.', { id: loadingToast });
      }
    }
  };

  const fetchLeaderboard = async (examId) => {
    if (!examId) return [];
    
    const { data, error } = await supabase
      .from('history')
      .select('studentname, score, date, examtitle, subject')
      .eq('examid', examId)
      .order('score', { ascending: false })
      .order('date', { ascending: true })
      .limit(10);
      
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    return data || [];
  };


  // Actions
  const addExam = async (newExam) => {
    const examToInsert = {
      id: `exam_${Date.now()}`,
      title: newExam.title,
      subject: newExam.subject,
      duration: String(newExam.duration),
      status: 'Aktif',
      questions: newExam.questions,
      shuffle_questions: newExam.shuffle_questions || false,
      shuffle_options: newExam.shuffle_options || false,
      start_time: newExam.start_time || null,
      end_time: newExam.end_time || null,
      show_discussion: newExam.show_discussion || false,
      admin_id: user.admin_id
    };

    const loadingToast = toast.loading('Membuat sesi ujian baru...');

    const { error } = await supabase.from('exams').insert([examToInsert]);
    
    if (error) {
      console.error('Error adding exam:', error);
      toast.error('Gagal menyimpan ujian ke database.', { id: loadingToast });
    } else {
      setExams([examToInsert, ...exams]);
      toast.success('Ujian berhasil disimpan!', { id: loadingToast });
    }
  };

  const deleteExam = async (id) => {
    if (await showConfirm('Hapus Ujian', 'Apakah Anda yakin ingin menghapus ujian ini? Data akan musnah dari server.')) {
      const loadingToast = toast.loading('Menghapus ujian...');
      const { error } = await supabase.from('exams').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting exam:', error);
        toast.error('Gagal menghapus ujian dari server.', { id: loadingToast });
      } else {
        setExams(exams.filter(exam => exam.id !== id));
        toast.success('Ujian berhasil dihapus dari Cloud.', { id: loadingToast });
      }
    }
  };

  const updateExam = async (id, updates) => {
    const loadingToast = toast.loading('Memperbarui data ujian...');
    const { error } = await supabase
      .from('exams')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating exam:', error);
      toast.error('Gagal memperbarui ujian.', { id: loadingToast });
      return false;
    } else {
      setExams((prev) => prev.map(x => x.id === id ? { ...x, ...updates } : x));
      toast.success('Data ujian berhasil diperbarui!', { id: loadingToast });
      return true;
    }
  };

  const saveResult = async (result) => {
    const dbPayload = {
      id: `history_${Date.now()}`,
      examid: result.examId,
      examtitle: result.examTitle,
      subject: result.subject,
      score: result.score,
      totalquestions: result.totalQuestions,
      correctanswers: result.correctAnswers,
      status: result.status,
      date: new Date().toISOString(),
      studentname: user?.name || 'Siswa Tanpa Nama',
      details_snapshot: result.details || null,
      admin_id: user.admin_id
    };

    const localStateRecord = {
      id: dbPayload.id,
      examId: dbPayload.examid,
      examTitle: dbPayload.examtitle,
      subject: dbPayload.subject,
      score: dbPayload.score,
      totalQuestions: dbPayload.totalquestions,
      correctAnswers: dbPayload.correctanswers,
      status: dbPayload.status,
      date: dbPayload.date,
      studentName: dbPayload.studentname,
      details_snapshot: dbPayload.details_snapshot
    };

    const loadingToast = toast.loading('Memproses kalkulasi nilai ke Server...');
    const { error } = await supabase.from('history').insert([dbPayload]);
    
    if (error) {
      console.error('Error saving result:', error);
      toast.error('Gagal menyimpan nilai ujian ke database.', { id: loadingToast });
    } else {
      setHistory([localStateRecord, ...history]);
      toast.success('Nilai Anda telah divaridasi & disimpan di Cloud!', { id: loadingToast });
    }
  };

  const addStudent = async (newStudent) => {
    const studentToInsert = {
      id: `std_${Date.now()}`,
      nis: String(newStudent.nis),
      name: newStudent.name,
      class: newStudent.class,
      password: newStudent.password,
      status: 'Aktif',
      admin_id: user.admin_id
    };

    const loadingToast = toast.loading('Mendaftarkan siswa ke Cloud...');
    const { error } = await supabase.from('students').insert([studentToInsert]);
    
    if (error) {
      console.error('Error adding student:', error);
      if (error.code === '23505') { // Postgres string unique violation
         toast.error('Pendaftaran gagal. NIS tersebut sudah terdaftar!', { id: loadingToast });
      } else {
         toast.error('Gagal menambahkan siswa ke database.', { id: loadingToast });
      }
      return false;
    } else {
      setStudents([studentToInsert, ...students]);
      toast.success('Siswa berhasil didaftarkan!', { id: loadingToast });
      return true;
    }
  };

  const importStudents = async (studentArray) => {
    const studentsToInsert = studentArray.map(s => ({
      id: `std_${Date.now()}_${Math.floor(Math.random()*100000)}`,
      nis: String(s.nis),
      name: s.name,
      class: s.class,
      password: String(s.password),
      status: 'Aktif',
      admin_id: user.admin_id
    }));

    const loadingToast = toast.loading('Mengimpor data siswa massal...');
    const { error } = await supabase.from('students').insert(studentsToInsert);
    
    if (error) {
      console.error('Error importing students:', error);
      toast.error('Gagal impor siswa: ' + error.message, { id: loadingToast });
      return false;
    } else {
      setStudents([...studentsToInsert, ...students]);
      toast.success(`${studentsToInsert.length} data siswa berhasil diimpor.`, { id: loadingToast });
      return true;
    }
  };

  const deleteStudent = async (id) => {
    if (await showConfirm('Hapus Siswa', 'Yakin ingin menghapus siswa ini secara permanen dari server?')) {
      const loadingToast = toast.loading('Menghapus siswa...');
      const { error } = await supabase.from('students').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting student:', error);
        toast.error('Gagal menghapus siswa dari server.', { id: loadingToast });
      } else {
        setStudents(students.filter(std => std.id !== id));
        toast.success('Siswa berhasil dihapus dari Cloud.', { id: loadingToast });
      }
    }
  };

  const updateStudent = async (id, updates) => {
    const loadingToast = toast.loading('Memperbarui data siswa...');
    
    // Perbarui data database
    const { error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating student:', error);
      if (error.code === '23505') {
         toast.error('Gagal memperbarui. Nomor Induk Siswa telah digunakan!', { id: loadingToast });
      } else {
         toast.error('Gagal memperbarui data siswa.', { id: loadingToast });
      }
      return false;
    } else {
      setStudents((prev) => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('Data siswa berhasil diperbarui!', { id: loadingToast });
      return true;
    }
  };

  const addStaff = async (newStaff) => {
    const staffToInsert = {
      id: `usr_${Date.now()}`,
      username: newStaff.username.toLowerCase(),
      name: newStaff.name,
      role: newStaff.role,
      password: newStaff.password,
      status: 'Aktif',
      admin_id: user.admin_id
    };

    const loadingToast = toast.loading('Mendaftarkan akses pegawai ke Cloud...');
    const { error } = await supabase.from('users').insert([staffToInsert]);
    
    if (error) {
      console.error('Error adding staff:', error);
      if (error.code === '23505') { 
         toast.error('Pendaftaran gagal. Nama Pengguna (Username) tersebut telah terpakai!', { id: loadingToast });
      } else {
         toast.error('Gagal menambahkan rekrutmen pegawai ke database.', { id: loadingToast });
      }
      return false;
    } else {
      setStaffList([staffToInsert, ...staffList]);
      toast.success('Akses pegawai resmi didaftarkan!', { id: loadingToast });
      return true;
    }
  };

  const deleteStaff = async (id) => {
    if (await showConfirm('Blokir Akses Pegawai', 'Peringatan Eksekutif: Yakin mencabut hak akses pegawai ini ke server?')) {
      const loadingToast = toast.loading('Memblokade pegawai...');
      const { error } = await supabase.from('users').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting staff:', error);
        toast.error('Gagal menghapus wewenang pegawai dari server.', { id: loadingToast });
      } else {
        setStaffList(staffList.filter(s => s.id !== id));
        toast.success('Akun pegawai telah dicabut dari Cloud.', { id: loadingToast });
      }
    }
  };

  const updateStaff = async (id, updates) => {
    const loadingToast = toast.loading('Memperbarui data staf...');
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating staff:', error);
      if (error.code === '23505') { 
         toast.error('Gagal memperbarui. Username tersebut telah terpakai!', { id: loadingToast });
      } else {
         toast.error('Gagal memperbarui rekaman staf.', { id: loadingToast });
      }
      return false;
    } else {
      setStaffList((prev) => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      toast.success('Pembaruan data staf sukses!', { id: loadingToast });
      return true;
    }
  };

  const addQuestion = async (newQuestion) => {
    const qToInsertDB = {
      id: `q_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      subject: newQuestion.subject,
      text: newQuestion.text,
      imageurl: newQuestion.imageUrl || null,
      optionimages: newQuestion.optionImages || [],
      options: newQuestion.options,
      correctoption: newQuestion.correctOption,
      admin_id: user.admin_id
    };
    const qToInsertLocal = { ...qToInsertDB, imageUrl: newQuestion.imageUrl || null, optionImages: newQuestion.optionImages || [], correctOption: newQuestion.correctOption };

    const loadingToast = toast.loading('Menyimpan ke Bank Soal...');
    const { error } = await supabase.from('questions').insert([qToInsertDB]);
    
    if (error) {
      console.error('Error adding question:', error);
      toast.error('Gagal menyimpan ke Bank Soal: ' + error.message, { id: loadingToast });
      return null;
    } else {
      setQuestions([qToInsertLocal, ...questions]);
      toast.success('Disimpan ke Bank Soal.', { id: loadingToast });
      return qToInsertLocal;
    }
  };

  const importQuestions = async (questionArray) => {
    const questionsToInsertDB = questionArray.map(q => ({
      id: `q_${Date.now()}_${Math.floor(Math.random()*100000)}`,
      subject: q.subject,
      text: q.text,
      imageurl: q.imageUrl || null,
      optionimages: q.optionImages || [],
      options: q.options,
      correctoption: q.correctOption,
      admin_id: user.admin_id
    }));

    const loadingToast = toast.loading('Mengimpor massal ke Bank Soal...');
    const { error } = await supabase.from('questions').insert(questionsToInsertDB);
    
    if (error) {
      console.error('Error importing questions:', error);
      toast.error('Gagal impor soal: ' + error.message, { id: loadingToast });
      return false;
    } else {
      const localInsert = questionsToInsertDB.map((q, i) => ({
        ...q,
        correctOption: questionArray[i].correctOption
      }));
      setQuestions([...localInsert, ...questions]);
      toast.success(`${questionsToInsertDB.length} soal diimpor.`, { id: loadingToast });
      return true;
    }
  };

  const deleteQuestion = async (id) => {
    if (await showConfirm('Hapus Soal Bank', 'Hapus soal dari bank soal secara permanen?')) {
      const loadingToast = toast.loading('Menghapus soal...');
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) {
        toast.error('Gagal menghapus.', { id: loadingToast });
      } else {
        setQuestions(questions.filter(q => q.id !== id));
        toast.success('Soal dihapus.', { id: loadingToast });
      }
    }
  };

  const updateQuestion = async (id, updates) => {
    const loadingToast = toast.loading('Memperbarui bank soal...');
    
    // Ensure correct column naming mapping for supabase
    const dbUpdates = { ...updates };
    if (updates.correctOption !== undefined) {
      dbUpdates.correctoption = updates.correctOption;
      delete dbUpdates.correctOption;
    }
    if (updates.imageUrl !== undefined) {
      dbUpdates.imageurl = updates.imageUrl;
      delete dbUpdates.imageUrl;
    }
    if (updates.optionImages !== undefined) {
      dbUpdates.optionimages = updates.optionImages;
      delete dbUpdates.optionImages;
    }

    const { error } = await supabase
      .from('questions')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating question:', error);
      toast.error('Gagal memperbarui soal.', { id: loadingToast });
      return false;
    } else {
      setQuestions((prev) => prev.map(q => q.id === id ? { ...q, ...updates } : q));
      toast.success('Soal berhasil diperbarui!', { id: loadingToast });
      return true;
    }
  };

  const handleCloudLogin = async (username, password) => {
    const loadingToast = toast.loading('Memverifikasi protokol kredensial...');

    // 0. Cek autentikasi resmi (Supabase Auth) khusus untuk Admin yang login memakai email
    if (username.includes('@')) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (authData?.session) {
        const supUser = authData.session.user;
        const role = supUser.user_metadata?.role || 'admin';
        const name = supUser.user_metadata?.name || 'Administrator';
        const uName = supUser.user_metadata?.username || supUser.email;
        const admin_id = supUser.user_metadata?.admin_id || supUser.email;

        login({ username: uName, name, role, admin_id });
        toast.success(`Selamat datang, ${name}.`, { id: loadingToast });
        return role;
      }

      if (authError && authError.message.toLowerCase().includes('email not confirmed')) {
        toast.error('Gagal masuk: Email belum diaktivasi. Silakan periksa pesan konfirmasi di kotak masuk/spam Anda.', { id: loadingToast, duration: 6000 });
        return false;
      }
      // Jika Invalid Credentials, sistem akan melanjutkan perburuan ke tabel master 'users' dan 'students' 
      // untuk berjaga-jaga apabila username staf kebetulan memuat simbol '@'.
    }

    // 1. Cek secara brutal di tabel master staf (Admin, TU, Guru)
    const { data: staffData, error: staffError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (staffData && !staffError) {
      if (staffData.password !== password) {
        toast.error('Kata sandi kredensial pegawai mutlak salah.', { id: loadingToast });
        return false;
      }
      if (staffData.status !== 'Aktif') {
        toast.error('Akses profil Anda sedang ditangguhkan.', { id: loadingToast });
        return false;
      }
      login({ username: staffData.username, name: staffData.name, role: staffData.role, avatar_url: staffData.avatar_url, admin_id: staffData.admin_id });
      toast.success(`Hormat kami, ${staffData.name}.`, { id: loadingToast });
      return staffData.role;
    }

    // 2. Apabila gagal menemukan staf, lempar kerukan ke seluk-beluk siswa
    const { data: stdData, error: stdError } = await supabase.from('students').select('*').eq('nis', username).single();

    if (stdError || !stdData) {
      toast.error('Akses Ditolak. Identitas (baik admin maupun siswa) nihil.', { id: loadingToast });
      return false;
    }
    
    if (stdData.password !== password) {
      toast.error('Sandi sekuritas murid tidak valid.', { id: loadingToast });
      return false;
    }

    if (stdData.status !== 'Aktif') {
      toast.error('Hak akses ujian sedang dirantai pihak sekolah.', { id: loadingToast });
      return false;
    }

    // Sukses meretas status sebagai murid
    login({ username: stdData.nis, name: stdData.name, role: 'student', class: stdData.class, avatar_url: stdData.avatar_url, admin_id: stdData.admin_id });
    toast.success(`Selamat berjuang, ${stdData.name}!`, { id: loadingToast });
    return 'student';
  };

  const updateProfile = async (updates) => {
    if (!user) return false;
    const table = user.role === 'student' ? 'students' : 'users';
    const identifierCol = user.role === 'student' ? 'nis' : 'username';
    
    const loadingToast = toast.loading('Pembaruan terinkripsi mengudara ke Cloud...');
    
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq(identifierCol, user.username)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);
      toast.error('Jaringan gagal memperbarui konfigurasi pribadi Anda.', { id: loadingToast });
      return false;
    }

    setUser((prev) => ({ ...prev, name: data.name, avatar_url: data.avatar_url }));
    toast.success('Pembaruan selesai dan dibenamkan!', { id: loadingToast });
    return true;
  };

  const deleteProfile = async () => {
    if (!user) return false;
    
    if (await showConfirm('Hapus Akun Permanen', 'Peringatan: Seluruh riwayat ujian dan akses profil Anda akan musnah selamanya dari server. Setuju?', 'Ya, Hapus Permanen')) {
      const table = user.role === 'student' ? 'students' : 'users';
      const identifierCol = user.role === 'student' ? 'nis' : 'username';
      const loadingToast = toast.loading('Memusnahkan identitas Anda dari server...');
      
      const { error } = await supabase.from(table).delete().eq(identifierCol, user.username);
      
      if (error) {
        console.error("Profile deletion error:", error);
        toast.error('Gagal menghapus akun. Hubungi Administrator Anda.', { id: loadingToast });
        return false;
      }
      
      toast.success('Akun berhasil dicabut secara permanen. Selamat tinggal!', { id: loadingToast });
      logout();
      return true;
    }
    return false;
  };

  const registerUser = async (newUserData) => {
    const loadingToast = toast.loading('Memproses pendaftaran akun & sinkronisasi Email...');
    
    const { data, error } = await supabase.auth.signUp({
      email: newUserData.email,
      password: newUserData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          username: newUserData.email.toLowerCase(),
          name: newUserData.name,
          role: 'admin',
          admin_id: newUserData.email.toLowerCase(),
          status: 'Aktif'
        }
      }
    });

    const isAlreadyRegistered = 
      (error && error.message.toLowerCase().includes('already registered')) || 
      (data?.user?.identities && data.user.identities.length === 0);

    if (error && !isAlreadyRegistered) {
      console.error('Registration Error:', error);
      toast.error(`Pendaftaran gagal: ${error.message}`, { id: loadingToast });
      return false;
    }

    if (isAlreadyRegistered) {
      toast.loading('Email telah terdaftar. Mengirim ulang verifikasi...', { id: loadingToast });
      
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: newUserData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (resendError) {
        const errMsg = resendError.message.toLowerCase();
        if (errMsg.includes('over the email rate limit')) {
          toast.error('Gagal: Permintaan telalu sering. Sistem keamanan Supabase menunda pengiriman (Rate Limit). Silakan tunggu sekitar sejam.', { id: loadingToast, duration: 8000 });
        } else if (errMsg.includes('already verified') || resendError.status === 422) {
          toast.error('Gagal mengirim ulang. Akun ini sudah terverifikasi, silakan langsung Login.', { id: loadingToast, duration: 6000 });
        } else {
          toast.error(`Pendaftaran ulang gagal: ${resendError.message}`, { id: loadingToast });
        }
        return false;
      } else {
        toast.success('Email Anda sudah terdaftar! Silakan lakukan aktivasi via tautan konfirmasi terbaru di kotak masuk/spam email Anda.', { id: loadingToast, duration: 8000 });
        return true;
      }
    } else {
      toast.success('Pendaftaran Sukses! Silakan cek kotak masuk atau folder spam Email Anda untuk memverifikasi akun.', { id: loadingToast, duration: 6000 });
      return true;
    }
  };

  const handleGoogleLogin = async () => {
    toast.loading('Menyiapkan rute aman dari Google...', { duration: 1500 });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Google Auth Error:', error);
      toast.error('Infrastruktur Google Auth Anda rusak atau API Key GCP belum dipasang di Supabase.');
    }
  };

  const uploadImageToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `questions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('exam-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        toast.error('Gagal mengunggah gambar ke server.');
        return null;
      }

      const { data } = supabase.storage.from('exam-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
       console.error("Upload exception", error);
       toast.error('Terjadi pengecualian saat unggah.');
       return null;
    }
  };

  return (
    <AppContext.Provider value={{ 
      exams, setExams, addExam, deleteExam, updateExam,
      history, saveResult,
      fetchExamSession, upsertExamSession, deleteExamSession,
      students, addStudent, deleteStudent, importStudents, updateStudent,
      staffList, addStaff, deleteStaff, updateStaff,
      questions, addQuestion, deleteQuestion, importQuestions, updateQuestion,
      user, login, logout, handleCloudLogin, handleGoogleLogin, updateProfile, deleteProfile, registerUser,
      uploadImageToSupabase,
      fetchLeaderboard,
      showConfirm,
      schools, addSchool, updateSchool, deleteSchool,
      rooms, addRoom, deleteRoom, updateRoom,
      isFetching
    }}>
      {children}
    </AppContext.Provider>
  );
};
