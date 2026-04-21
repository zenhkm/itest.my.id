import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Archive,
  Database,
  UploadCloud,
  CheckSquare,
  BarChart2,
  Download,
  FileSpreadsheet,
  FileText,
  Trophy,
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Trash2,
  Save,
  ArrowLeft,
  ShieldCheck,
  Building,
  MapPin,
  Edit,
  Menu,
  X,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';
import './AdminDashboard.css';
import LiveRecord from './LiveRecord';
import Onboarding from './Onboarding';

const handleImageUpload = async (file) => {
  if (file.size > 2097152) {
    toast.error('Maksimal ukuran gambar 2MB');
    return null;
  }
  toast.loading('Mengunggah gambar...', { id: 'upload-img' });
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `questions/${fileName}`;
  
  const { error } = await supabase.storage.from('question-images').upload(filePath, file);
  
  if (error) {
    toast.error('Gagal mengunggah gambar', { id: 'upload-img' });
    console.error(error);
    return null;
  }
  
  const { data: publicUrlData } = supabase.storage.from('question-images').getPublicUrl(filePath);
  toast.success('Gambar berhasil diunggah', { id: 'upload-img' });
  return publicUrlData.publicUrl;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { exams, addExam, deleteExam, logout, user, students, addStudent, updateStudent, deleteStudent, history, fetchHistory, updateProfile, deleteAllAdminData, staffList, addStaff, updateStaff, deleteStaff, questions, addQuestion, updateQuestion, deleteQuestion, importQuestions, importStudents, schools, addSchool, updateSchool, deleteSchool, rooms, addRoom, updateRoom, deleteRoom, importRooms, groups, addGroup, updateGroup, deleteGroup, importGroups, importStaff, classes, addClass, updateClass, deleteClass, importClasses } = useContext(AppContext);
  const [analyticsRefreshing, setAnalyticsRefreshing] = React.useState(false);

  // â”€â”€ Onboarding â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user?.admin_id) {
      const done = localStorage.getItem(`onboarding_done_${user.admin_id}`);
      if (!done) setShowOnboarding(true);
    }
  }, [user?.admin_id]);

  const handleOnboardingComplete = () => {
    if (user?.admin_id) {
      localStorage.setItem(`onboarding_done_${user.admin_id}`, '1');
    }
    setShowOnboarding(false);
  };

  // handleOnboardingNavigate: only navigates â€” Onboarding minimizes itself
  const handleOnboardingNavigate = (tab) => {
    handleTabClick(tab);
  };

  // Signal to Onboarding that the current step's action is done
  const [onboardingStepDoneKey, setOnboardingStepDoneKey] = useState(null);
  const handleOnboardingStepDone = (key) => {
    setOnboardingStepDoneKey(key);
    setTimeout(() => setOnboardingStepDoneKey(null), 100);
  };
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleRefreshAnalytics = async () => {
    setAnalyticsRefreshing(true);
    await fetchHistory();
    setAnalyticsRefreshing(false);
    toast.success('Data laporan diperbarui.');
  };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ nis: '', name: '', class: '', password: '' });

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ username: '', name: '', role: 'guru', password: '' });

  const [analyticsExamId, setAnalyticsExamId] = useState('all');
  const [expandedAnalyticsExamId, setExpandedAnalyticsExamId] = useState(null);

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', members: [] });
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [showClassForm, setShowClassForm] = useState(false);
  const [newClass, setNewClass] = useState({ class_name: '', grade: '', description: '' });
  const [editingClassId, setEditingClassId] = useState(null);

  const [bankModalSubjectFilter, setBankModalSubjectFilter] = useState('all');
  const [bankModalClassFilter, setBankModalClassFilter] = useState('all');

  const handleSaveGroup = async () => {
    if (!newGroup.name) {
      toast.error('Nama kelompok wajib diisi.');
      return;
    }
    let success = false;
    if (editingGroupId) {
      success = await updateGroup(editingGroupId, newGroup);
    } else {
      success = await addGroup(newGroup);
    }
    if (success) {
      setNewGroup({ name: '', description: '', members: [] });
      setShowGroupForm(false);
      setEditingGroupId(null);
    }
  };

  const handleSaveClass = async () => {
    if (!newClass.class_name) {
      toast.error('Nama kelas wajib diisi.');
      return;
    }
    let success = false;
    if (editingClassId) {
      success = await updateClass(editingClassId, newClass);
    } else {
      success = await addClass(newClass);
    }
    if (success) {
      setNewClass({ class_name: '', grade: '', description: '' });
      setShowClassForm(false);
      setEditingClassId(null);
      if (!editingClassId && showOnboarding) handleOnboardingStepDone('classes-data');
    }
  };

  const downloadClassTemplate = () => {
    const templateData = [
      { 'Nama Kelas': '10 IPA 1', 'Tingkat/Grade': '10', 'Keterangan': 'Kelas IPA Unggulan' },
      { 'Nama Kelas': '11 IPS 2', 'Tingkat/Grade': '11', 'Keterangan': '' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Kelas');
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 35 }];
    XLSX.writeFile(wb, 'Template_Import_Kelas.xlsx');
  };

  const exportClassesToExcel = () => {
    if (classes.length === 0) return toast.error('Belum ada data kelas untuk diekspor.');
    const data = classes.map(c => ({
      'Nama Kelas': c.class_name,
      'Tingkat/Grade': c.grade || '',
      'Keterangan': c.description || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Kelas');
    ws['!cols'] = [{ wch: 22 }, { wch: 15 }, { wch: 35 }];
    XLSX.writeFile(wb, `Data_Kelas_${Date.now()}.xlsx`);
    toast.success('Data kelas berhasil diekspor.');
  };

  const handleClassImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length === 0) return toast.error('File Excel kosong atau tidak sesuai format.');
        const formatted = data.map(row => ({
          class_name: row['Nama Kelas'] || row['nama_kelas'] || row['kelas'] || '',
          grade: String(row['Tingkat/Grade'] || row['grade'] || row['tingkat'] || ''),
          description: row['Keterangan'] || row['description'] || ''
        })).filter(c => c.class_name !== '');
        if (formatted.length > 0) {
          const ok = await importClasses(formatted);
          if (ok && showOnboarding) handleOnboardingStepDone('classes-data');
        } else toast.error('Tidak ada data kelas valid ditemukan.');
      } catch { toast.error('Terjadi kesalahan membaca file Excel.'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const [qBankSubjectFilter, setQBankSubjectFilter] = useState('all');
  const [qBankSearch, setQBankSearch] = useState('');
  const [qBankSortCol, setQBankSortCol] = useState('');
  const [qBankSortDir, setQBankSortDir] = useState('asc');
  const [qBankPage, setQBankPage] = useState(1);
  const [qBankPerPage, setQBankPerPage] = useState(10);
  const [qBankSelectedSubject, setQBankSelectedSubject] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const [showBankForm, setShowBankForm] = useState(false);
  const [newBankQuestion, setNewBankQuestion] = useState({ subject: 'Umum', text: '', options: ['', '', '', '', ''], optionImages: ['', '', '', '', ''], correctOption: 0 });

  const handleSaveBankQuestion = async () => {
    if (!newBankQuestion.text || newBankQuestion.options.some(o => o.trim() === '')) {
      toast.error('Mohon lengkapi teks pertanyaan dan seluruh opsi jawaban.');
      return;
    }
    let success = false;
    if (editingQuestionId) {
      success = await updateQuestion(editingQuestionId, newBankQuestion);
    } else {
      success = await addQuestion(newBankQuestion);
    }

    if (success) {
      setShowBankForm(false);
      setEditingQuestionId(null);
      setNewBankQuestion({ subject: 'Umum', text: '', options: ['', '', '', '', ''], optionImages: ['', '', '', '', ''], correctOption: 0 });
      if (!editingQuestionId && showOnboarding) handleOnboardingStepDone('question-bank');
    }
  };

  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', npsn: '', address: '', principal: '', phone: '', status: 'Aktif' });

  const [showRoomForm, setShowRoomForm] = useState(false);
  const [newRoom, setNewRoom] = useState({ room_code: '', room_name: '', capacity: 30, status: 'Tersedia' });

  const handleSaveRoom = async () => {
    if (!newRoom.room_code || !newRoom.room_name) {
      toast.error('Kode Ruangan dan Nama Ruangan wajib diisi.');
      return;
    }
    let success = false;
    if (editingRoomId) {
      success = await updateRoom(editingRoomId, newRoom);
    } else {
      success = await addRoom(newRoom);
    }
    if (success) {
      setNewRoom({ room_code: '', room_name: '', capacity: 30, status: 'Tersedia' });
      setShowRoomForm(false);
      setEditingRoomId(null);
      if (!editingRoomId && showOnboarding) handleOnboardingStepDone('rooms-data');
    }
  };

  const handleSaveSchool = async () => {
    if (!newSchool.name || !newSchool.npsn) {
      toast.error('Nama dan NPSN Sekolah wajib diisi.');
      return;
    }
    let success = false;
    if (editingSchoolId) {
      success = await updateSchool(editingSchoolId, newSchool);
    } else {
      success = await addSchool(newSchool);
    }
    if (success) {
      setNewSchool({ name: '', npsn: '', address: '', principal: '', phone: '', status: 'Aktif' });
      setShowSchoolForm(false);
      setEditingSchoolId(null);
      if (!editingSchoolId && showOnboarding) handleOnboardingStepDone('school-data');
    }
  };

  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    password: '',
    avatar_url: user?.avatar_url || ''
  });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) {
        toast.error("Ukuran pasfoto terlalu besar. Maksimal 1MB!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileSettings({ ...profileSettings, avatar_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    const updates = {};
    if (profileSettings.name && profileSettings.name !== user.name) updates.name = profileSettings.name;
    if (profileSettings.password) updates.password = profileSettings.password;
    if (profileSettings.avatar_url && profileSettings.avatar_url !== user.avatar_url) updates.avatar_url = profileSettings.avatar_url;

    if (Object.keys(updates).length > 0) {
      const ok = await updateProfile(updates);
      if (ok) {
        setProfileSettings({ ...profileSettings, password: '' });
      }
    } else {
      toast('Belum ada perubahan data yang disimpan.', { icon: 'â„¹ï¸ڈ' });
    }
  };

  const handleSaveStudent = async () => {
    if (!newStudent.nis || !newStudent.name || !newStudent.class) {
      toast.error('Mohon isi NIS, Nama, dan Kelas.');
      return;
    }
    if (!editingStudentId && !newStudent.password) {
      toast.error('Kata sandi awal wajib diset saat pendaftaran.');
      return;
    }

    let success = false;
    if (editingStudentId) {
      const updates = { ...newStudent };
      if (!updates.password || updates.password.trim() === '') {
        delete updates.password; // Do not overwrite with blank
      }
      success = await updateStudent(editingStudentId, updates);
    } else {
      success = await addStudent(newStudent);
    }

    if (success) {
      setNewStudent({ nis: '', name: '', class: '', password: '' });
      setShowStudentForm(false);
      setEditingStudentId(null);
      if (!editingStudentId && showOnboarding) handleOnboardingStepDone('students');
    }
  };

  const downloadStudentExcelTemplate = () => {
    const templateData = [
      {
        'Nomor Induk Siswa (NIS)': '10101',
        'Nama Lengkap': 'Ahmad Dahlan',
        'Kelas': '10 IPA 1',
        'Kata Sandi Login': 'siswa123'
      },
      {
        'Nomor Induk Siswa (NIS)': '10102',
        'Nama Lengkap': 'Cut Nyak Dien',
        'Kelas': '10 IPA 2',
        'Kata Sandi Login': 'siswa123'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Siswa');
    worksheet['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 25 }];
    XLSX.writeFile(workbook, 'Template_Pendaftaran_Siswa.xlsx');
  };

  const handleStudentExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          return toast.error('File Excel kosong atau tidak sesuai format.');
        }

        const formattedStudents = data.map(item => {
          const nis = item['Nomor Induk Siswa (NIS)'] || item['NIS'] || '';
          const name = item['Nama Lengkap'] || item['Nama'] || '';
          const cls = item['Kelas'] || item['Class'] || 'Umum';
          const pw = item['Kata Sandi Login'] || item['Password'] || item['Kata Sandi'] || '123456';

          return { nis, name, class: cls, password: pw };
        }).filter(s => s.nis !== '' && s.name !== '');

        if (formattedStudents.length > 0) {
          const ok = await importStudents(formattedStudents);
          if (ok && showOnboarding) handleOnboardingStepDone('students');
        } else {
          toast.error('Tidak ada data siswa yang valid. Pastikan kolom NIS dan Nama terisi.');
        }

      } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan membaca file Excel.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleSaveStaff = async () => {
    if (!newStaff.username || !newStaff.name) {
      toast.error('Mohon lengkapi username dan nama tampilan pegawai.');
      return;
    }
    if (!editingStaffId && !newStaff.password) {
      toast.error('Kata sandi harus diisi untuk proses rekrutmen awal.');
      return;
    }

    let success = false;
    if (editingStaffId) {
      const updates = { ...newStaff };
      if (!updates.password || updates.password.trim() === '') {
        delete updates.password; // Ignore blank password on update
      }
      success = await updateStaff(editingStaffId, updates);
    } else {
      success = await addStaff(newStaff);
    }

    if (success) {
      setNewStaff({ username: '', name: '', role: 'guru', password: '' });
      setShowStaffForm(false);
      setEditingStaffId(null);
    }
  };

  const avgScore = history.length > 0
    ? (history.reduce((acc, curr) => acc + curr.score, 0) / history.length).toFixed(1)
    : 0;

  // New Exam State
  const [newExam, setNewExam] = useState({
    title: '',
    subject: '',
    duration: '',
    questions: [],
    shuffle_questions: false,
    shuffle_options: false,
    start_time: '',
    end_time: '',
    show_discussion: false,
    group_id: '',
    room_id: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddQuestion = () => {
    setNewExam({
      ...newExam,
      questions: [
        ...newExam.questions,
        { id: Date.now(), text: '', options: ['', '', '', '', ''], optionImages: ['', '', '', '', ''], correctOption: 0 }
      ]
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newExam.questions];
    updatedQuestions[index][field] = value;
    setNewExam({ ...newExam, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updatedQuestions = [...newExam.questions];
    updatedQuestions[qIndex].options[optIndex] = value;
    setNewExam({ ...newExam, questions: updatedQuestions });
  };

  const handleExamOptionImageChange = (qIndex, optIndex, url) => {
    const updatedQuestions = [...newExam.questions];
    if (!updatedQuestions[qIndex].optionImages) {
      updatedQuestions[qIndex].optionImages = ['', '', '', '', ''];
    }
    updatedQuestions[qIndex].optionImages[optIndex] = url;
    setNewExam({ ...newExam, questions: updatedQuestions });
  };
  
  const handleBankOptionImageChange = (optIndex, url) => {
    const newImages = [...(newBankQuestion.optionImages || ['', '', '', '', ''])];
    newImages[optIndex] = url;
    setNewBankQuestion({ ...newBankQuestion, optionImages: newImages });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = newExam.questions.filter((_, i) => i !== index);
    setNewExam({ ...newExam, questions: updatedQuestions });
  };

  const toggleBankQuestionSelection = (question) => {
    if (selectedBankQuestions.find(q => q.id === question.id)) {
      setSelectedBankQuestions(selectedBankQuestions.filter(q => q.id !== question.id));
    } else {
      setSelectedBankQuestions([...selectedBankQuestions, question]);
    }
  };

  const applyBankQuestions = () => {
    const clonedQuestions = selectedBankQuestions.map((q, idx) => ({
      id: Date.now() + idx,
      text: q.text,
      imageUrl: q.imageUrl || null,
      options: [...q.options],
      optionImages: [...(q.optionImages || ['', '', '', '', ''])],
      correctOption: q.correctOption
    }));

    setNewExam({
      ...newExam,
      questions: [...newExam.questions, ...clonedQuestions]
    });

    setShowBankModal(false);
    setSelectedBankQuestions([]);
    setBankModalSubjectFilter('all');
    setBankModalClassFilter('all');
    toast.success(`${clonedQuestions.length} soal berhasil disematkan dari bank.`);
  };

  const handleExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          return toast.error('File Excel kosong atau tidak sesuai format.');
        }

        const formattedQuestions = data.map(item => {
          const sub = item['Mata Pelajaran'] || item['Subject'] || 'Umum';
          const text = item['Pertanyaan'] || item['Question'] || '';
          const options = [
            item['Opsi A'] || item['A'] || '',
            item['Opsi B'] || item['B'] || '',
            item['Opsi C'] || item['C'] || '',
            item['Opsi D'] || item['D'] || '',
            item['Opsi E'] || item['E'] || ''
          ];

          let correctOpt = 0;
          let rawKunci = String(item['Kunci Jawaban'] || item['Kunci'] || '0').toUpperCase().trim();
          if (rawKunci === 'A') correctOpt = 0;
          else if (rawKunci === 'B') correctOpt = 1;
          else if (rawKunci === 'C') correctOpt = 2;
          else if (rawKunci === 'D') correctOpt = 3;
          else if (rawKunci === 'E') correctOpt = 4;
          else correctOpt = parseInt(rawKunci) || 0;

          if (correctOpt > 4) correctOpt = 0;

          return { subject: sub, text, options, correctOption: correctOpt };
        }).filter(q => q.text !== '');

        if (formattedQuestions.length > 0) {
          const ok = await importQuestions(formattedQuestions);
          if (ok && showOnboarding) handleOnboardingStepDone('question-bank');
        } else {
          toast.error('Tidak ada data pertanyaan yang valid ditemukan.');
        }

      } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan membaca file Excel.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const downloadExcelTemplate = () => {
    const templateData = [
      {
        'Mata Pelajaran': 'Contoh: Sejarah',
        'Pertanyaan': 'Contoh: Apa arti semboyan Bhineka Tunggal Ika?',
        'Opsi A': 'Berbeda-beda tetapi tetap satu',
        'Opsi B': 'Bersama selamanya',
        'Opsi C': 'Berubah-ubah terus',
        'Opsi D': 'Bintang di langit',
        'Opsi E': 'Semuanya benar',
        'Kunci Jawaban': 'A'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Bank_Soal');
    worksheet['!cols'] = [{ wch: 20 }, { wch: 60 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 20 }];
    XLSX.writeFile(workbook, 'Template_Bank_Soal.xlsx');
  };

  const handleSaveExam = async () => {
    if (!newExam.title || !newExam.subject || !newExam.duration) {
      toast.error('Mohon lengkapi data ujian (Nama, Mata Pelajaran, Durasi).');
      return;
    }
    if (newExam.questions.length === 0) {
      toast.error('Mohon tambahkan minimal 1 pertanyaan.');
      return;
    }

    await addExam(newExam);
    setNewExam({ title: '', subject: '', duration: '', questions: [], shuffle_questions: false, shuffle_options: false, start_time: '', end_time: '', show_discussion: false, group_id: '', room_id: '' });
    setActiveTab('exams');
  };

  // Analytics Export Functions
  const getAnalyticsData = () => {
    let filtered = history;
    if (analyticsExamId !== 'all') {
      filtered = history.filter(h => h.examId === analyticsExamId);
    }
    return filtered;
  };

  const exportToCSV = () => {
    const data = getAnalyticsData();
    if (data.length === 0) return toast.error('Tidak ada data untuk diekspor');

    const headers = ['NIM', 'Nama Siswa', 'Ujian', 'Mata Pelajaran', 'Nilai', 'Benar', 'Total Soal', 'Tanggal'];
    const csvContent = [
      headers.join(','),
      ...data.map(r => {
        const nim = students.find(s => s.name === r.studentName)?.nis || '-';
        return `"${nim}","${r.studentName || 'Anonim'}","${r.examTitle}","${r.subject}","${r.score}","${r.correctAnswers}","${r.totalQuestions}","${new Date(r.date).toLocaleString('id-ID')}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Nilai_${Date.now()}.csv`;
    link.click();
    toast.success('File CSV berhasil diunduh');
  };

  const exportToExcel = () => {
    const data = getAnalyticsData();
    if (data.length === 0) return toast.error('Tidak ada data untuk diekspor');

    const formattedData = data.map(r => ({
      'NIM': students.find(s => s.name === r.studentName)?.nis || '-',
      'Nama Siswa': r.studentName || 'Anonim',
      'Ujian': r.examTitle,
      'Mata Pelajaran': r.subject,
      'Nilai': r.score,
      'Benar': r.correctAnswers,
      'Total Soal': r.totalQuestions,
      'Tanggal': new Date(r.date).toLocaleString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Nilai');
    XLSX.writeFile(workbook, `Laporan_Nilai_${Date.now()}.xlsx`);
    toast.success('File Excel berhasil diunduh');
  };

  const exportToPDF = () => {
    const data = getAnalyticsData();
    if (data.length === 0) return toast.error('Tidak ada data untuk diekspor');

    const doc = new jsPDF();
    doc.text('Laporan Hasil Ujian & Rekapitulasi Nilai Siswa', 14, 15);

    const tableColumn = ['NIM', 'Nama Siswa', 'Ujian', 'Smt / Mapel', 'Nilai', 'Benar/Soal', 'Tanggal'];
    const tableRows = [];

    data.forEach(r => {
      const nim = students.find(s => s.name === r.studentName)?.nis || '-';
      const rowData = [
        nim,
        r.studentName || 'Anonim',
        r.examTitle,
        r.subject,
        r.score,
        `${r.correctAnswers}/${r.totalQuestions}`,
        new Date(r.date).toLocaleDateString('id-ID')
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233] },
    });

    doc.save(`Laporan_Nilai_${Date.now()}.pdf`);
    toast.success('File PDF berhasil diunduh');
  };

  // â”€â”€ Export per-ujian â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const exportExamToExcel = (eg) => {
    const formattedData = eg.records.map(r => ({
      'NIM': students.find(s => s.name === r.studentName)?.nis || '-',
      'Nama Siswa': r.studentName || 'Anonim',
      'Nilai': r.score,
      'Benar': r.correctAnswers,
      'Total Soal': r.totalQuestions,
      'Status': r.status || (r.score >= 70 ? 'Lulus' : 'Tidak Lulus'),
      'Tanggal': new Date(r.date).toLocaleString('id-ID')
    }));
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Ujian');
    ws['!cols'] = [{ wch: 15 }, { wch: 35 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 25 }];
    XLSX.writeFile(wb, `Hasil_${eg.examTitle.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
    toast.success('File Excel ujian berhasil diunduh');
  };

  const exportExamToPDF = (eg) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Laporan Ujian: ${eg.examTitle}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Mata Pelajaran: ${eg.subject}  |  Peserta: ${eg.total}  |  Rata-rata: ${eg.avg}`, 14, 23);
    autoTable(doc, {
      head: [['NIM', 'Nama Siswa', 'Nilai', 'Benar/Soal', 'Status', 'Tanggal']],
      body: eg.records.map(r => [
        students.find(s => s.name === r.studentName)?.nis || '-',
        r.studentName || 'Anonim',
        r.score,
        `${r.correctAnswers}/${r.totalQuestions}`,
        r.status || (r.score >= 70 ? 'Lulus' : 'Tidak Lulus'),
        new Date(r.date).toLocaleDateString('id-ID')
      ]),
      startY: 28,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [14, 165, 233] },
    });
    doc.save(`Hasil_${eg.examTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    toast.success('File PDF ujian berhasil diunduh');
  };

  // â”€â”€ Kelompok Import/Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const downloadGroupTemplate = () => {
    const templateData = [
      { 'Nama Kelompok': 'Kelompok A', 'Keterangan': 'Kelas X IPA 1', 'Anggota (NIS pisah koma)': '10101,10102,10103' },
      { 'Nama Kelompok': 'Kelompok B', 'Keterangan': 'Kelas X IPA 2', 'Anggota (NIS pisah koma)': '10104,10105' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Kelompok');
    ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 40 }];
    XLSX.writeFile(wb, 'Template_Import_Kelompok.xlsx');
  };

  const exportGroupsToExcel = () => {
    if (groups.length === 0) return toast.error('Belum ada data kelompok untuk diekspor.');
    const data = groups.map(g => ({
      'Nama Kelompok': g.name,
      'Keterangan': g.description || '',
      'Jumlah Anggota': Array.isArray(g.members) ? g.members.length : 0,
      'Anggota (NIS pisah koma)': Array.isArray(g.members) ? g.members.join(',') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Kelompok');
    ws['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 50 }];
    XLSX.writeFile(wb, `Data_Kelompok_${Date.now()}.xlsx`);
    toast.success('Data kelompok berhasil diekspor.');
  };

  const handleGroupImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length === 0) return toast.error('File Excel kosong atau tidak sesuai format.');
        const formatted = data.map(row => ({
          name: row['Nama Kelompok'] || row['nama'] || '',
          description: row['Keterangan'] || row['deskripsi'] || '',
          members: row['Anggota (NIS pisah koma)'] || row['members'] || ''
        })).filter(g => g.name !== '');
        if (formatted.length > 0) await importGroups(formatted);
        else toast.error('Tidak ada data kelompok valid ditemukan.');
      } catch { toast.error('Terjadi kesalahan membaca file Excel.'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // â”€â”€ Ruangan Import/Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const downloadRoomTemplate = () => {
    const templateData = [
      { 'Kode Ruangan': 'LAB-01', 'Nama Ruangan': 'Laboratorium Komputer 1', 'Kapasitas': 30, 'Status': 'Tersedia' },
      { 'Kode Ruangan': 'R-101', 'Nama Ruangan': 'Ruang Kelas 101', 'Kapasitas': 35, 'Status': 'Tersedia' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Ruangan');
    ws['!cols'] = [{ wch: 18 }, { wch: 35 }, { wch: 12 }, { wch: 15 }];
    XLSX.writeFile(wb, 'Template_Import_Ruangan.xlsx');
  };

  const exportRoomsToExcel = () => {
    if (rooms.length === 0) return toast.error('Belum ada data ruangan untuk diekspor.');
    const data = rooms.map(r => ({
      'Kode Ruangan': r.room_code,
      'Nama Ruangan': r.room_name,
      'Kapasitas': r.capacity,
      'Status': r.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Ruangan');
    ws['!cols'] = [{ wch: 18 }, { wch: 35 }, { wch: 12 }, { wch: 15 }];
    XLSX.writeFile(wb, `Data_Ruangan_${Date.now()}.xlsx`);
    toast.success('Data ruangan berhasil diekspor.');
  };

  const handleRoomImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length === 0) return toast.error('File Excel kosong atau tidak sesuai format.');
        const formatted = data.map(row => ({
          room_code: String(row['Kode Ruangan'] || row['kode'] || ''),
          room_name: row['Nama Ruangan'] || row['nama'] || '',
          capacity: Number(row['Kapasitas'] || row['capacity'] || 30),
          status: row['Status'] || row['status'] || 'Tersedia'
        })).filter(r => r.room_code !== '' && r.room_name !== '');
        if (formatted.length > 0) {
          const ok = await importRooms(formatted);
          if (ok && showOnboarding) handleOnboardingStepDone('rooms-data');
        } else toast.error('Tidak ada data ruangan valid ditemukan.');
      } catch { toast.error('Terjadi kesalahan membaca file Excel.'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  // â”€â”€ Pegawai Import/Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const downloadStaffTemplate = () => {
    const templateData = [
      { 'Username Login': 'guru.budi', 'Nama Tampilan': 'Budi Santoso, S.Pd', 'Peran': 'guru', 'Kata Sandi Awal': 'sandi123' },
      { 'Username Login': 'tu.ani', 'Nama Tampilan': 'Ani Rahayu', 'Peran': 'TU', 'Kata Sandi Awal': 'sandi123' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Pegawai');
    ws['!cols'] = [{ wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 20 }];
    XLSX.writeFile(wb, 'Template_Import_Pegawai.xlsx');
  };

  const exportStaffToExcel = () => {
    if (staffList.length === 0) return toast.error('Belum ada data pegawai untuk diekspor.');
    const data = staffList.map(s => ({
      'Username Login': s.username,
      'Nama Tampilan': s.name,
      'Peran': s.role,
      'Status': s.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pegawai');
    ws['!cols'] = [{ wch: 22 }, { wch: 35 }, { wch: 15 }, { wch: 12 }];
    XLSX.writeFile(wb, `Data_Pegawai_${Date.now()}.xlsx`);
    toast.success('Data pegawai berhasil diekspor.');
  };

  const handleStaffImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length === 0) return toast.error('File Excel kosong atau tidak sesuai format.');
        const validRoles = ['admin', 'guru', 'pengawas', 'TU'];
        const formatted = data.map(row => ({
          username: String(row['Username Login'] || row['username'] || '').toLowerCase(),
          name: row['Nama Tampilan'] || row['nama'] || '',
          role: validRoles.includes(row['Peran'] || row['role']) ? (row['Peran'] || row['role']) : 'guru',
          password: String(row['Kata Sandi Awal'] || row['password'] || '123456')
        })).filter(s => s.username !== '' && s.name !== '');
        if (formatted.length > 0) await importStaff(formatted);
        else toast.error('Tidak ada data pegawai valid ditemukan.');
      } catch { toast.error('Terjadi kesalahan membaca file Excel.'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const analyticsData = getAnalyticsData();
  const uniqueAnalyticsExams = [...new Set(history.map(h => h.examId))].map(id => {
    const ht = history.find(h => h.examId === id);
    return { id, title: ht.examTitle, subject: ht.subject };
  });

  const anTotalPeserta = analyticsData.length;
  const anRataRata = anTotalPeserta > 0 ? (analyticsData.reduce((acc, curr) => acc + curr.score, 0) / anTotalPeserta).toFixed(1) : 0;
  const anMax = anTotalPeserta > 0 ? Math.max(...analyticsData.map(h => h.score)) : 0;
  const anMin = anTotalPeserta > 0 ? Math.min(...analyticsData.map(h => h.score)) : 0;

  const searchTerm = globalSearch.toLowerCase();
  
  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm) || 
    e.subject.toLowerCase().includes(searchTerm)
  );
  
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm) || 
    s.nis.toLowerCase().includes(searchTerm) ||
    s.class.toLowerCase().includes(searchTerm)
  );

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm) || 
    s.username.toLowerCase().includes(searchTerm) ||
    s.role.toLowerCase().includes(searchTerm)
  );

  const filteredHistory = analyticsData.filter(h => 
    (h.studentName || '').toLowerCase().includes(searchTerm) || 
    h.examTitle.toLowerCase().includes(searchTerm) ||
    h.subject.toLowerCase().includes(searchTerm)
  );

  // Per-exam grouped analytics (depends on filteredHistory - must be defined after)
  const examAnalyticsGroups = (() => {
    const grouped = {};
    filteredHistory.forEach(h => {
      if (!grouped[h.examId]) grouped[h.examId] = { examId: h.examId, examTitle: h.examTitle, subject: h.subject, records: [] };
      grouped[h.examId].records.push(h);
    });
    return Object.values(grouped).map(g => {
      const scores = g.records.map(r => r.score);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
      const max = scores.length > 0 ? Math.max(...scores) : 0;
      const min = scores.length > 0 ? Math.min(...scores) : 0;
      const passed = g.records.filter(r => r.score >= 70).length;
      return { ...g, avg, max, min, passed, total: g.records.length };
    });
  })();

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm) || 
    q.subject.toLowerCase().includes(searchTerm)
  );

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchTerm) || 
    s.npsn.toLowerCase().includes(searchTerm)
  );

  const filteredRooms = rooms.filter(r => 
    r.room_name.toLowerCase().includes(searchTerm) || 
    r.room_code.toLowerCase().includes(searchTerm)
  );

  return (
    <motion.div
      className="admin-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background */}
      <div className="admin-background">
        <div className="blob blob-admin-1"></div>
        <div className="blob blob-admin-2"></div>
      </div>

      {/* Sidebar Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      <aside className={`admin-sidebar glass-panel ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-container sm admin-logo" style={{ width: '36px', height: '36px' }}>
              <Activity size={20} className="logo-icon white" />
            </div>
            <h2>AdminPanel</h2>
          </div>
          <button className="mobile-menu-close hide-on-desktop" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {['admin', 'guru'].includes(user?.role) && (
            <button
              className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`}
              onClick={() => handleTabClick('exams')}
            >
              <BookOpen size={20} />
              <span>Manajemen Ujian</span>
            </button>
          )}

          {['admin', 'guru'].includes(user?.role) && (
            <button
              className={`nav-item ${activeTab === 'question-bank' ? 'active' : ''}`}
              onClick={() => handleTabClick('question-bank')}
            >
              <Database size={20} />
              <span>Bank Soal</span>
            </button>
          )}

          {['admin', 'guru'].includes(user?.role) && (
            <button
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => handleTabClick('analytics')}
            >
              <BarChart2 size={20} />
              <span>Laporan Nilai</span>
            </button>
          )}

          {['admin', 'guru', 'TU'].includes(user?.role) && (
            <button
              className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => handleTabClick('students')}
            >
              <Users size={20} />
              <span>Manajemen Siswa</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => handleTabClick('staff')}
            >
              <ShieldCheck size={20} />
              <span>Manajemen Pegawai</span>
            </button>
          )}

          {['admin', 'TU'].includes(user?.role) && (
            <button
              className={`nav-item ${activeTab === 'school-data' ? 'active' : ''}`}
              onClick={() => handleTabClick('school-data')}
            >
              <Building size={20} />
              <span>Data Lembaga</span>
            </button>
          )}

          {['admin', 'TU', 'guru'].includes(user?.role) && (
            <button
              className={`nav-item ${activeTab === 'rooms-data' ? 'active' : ''}`}
              onClick={() => handleTabClick('rooms-data')}
            >
              <MapPin size={20} />
              <span>Data Ruangan</span>
            </button>
          )}

          {['admin', 'TU', 'guru'].includes(user?.role) && (
            <button
              className={`nav-item ${activeTab === 'classes-data' ? 'active' : ''}`}
              onClick={() => handleTabClick('classes-data')}
            >
              <BookOpen size={20} />
              <span>Data Kelas</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className={`nav-item ${activeTab === 'live-record' ? 'active' : ''}`}
              onClick={() => handleTabClick('live-record')}
            >
              <Activity size={20} />
              <span>Live Record</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              className={`nav-item ${activeTab === 'groups-data' ? 'active' : ''}`}
              onClick={() => handleTabClick('groups-data')}
            >
              <Layers size={20} />
              <span>Data Kelompok</span>
            </button>
          )}

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabClick('settings')}
          >
            <Settings size={20} />
            <span>Pengaturan</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile" onClick={() => handleTabClick('settings')} style={{ cursor: 'pointer' }} title="Buka Pengaturan Akun">
            <div className="admin-avatar" style={{ overflow: 'hidden' }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="avatar-initials">{(user?.name || 'AD').substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="admin-info">
              <span className="admin-name">{user?.name || 'Staf Internal'}</span>
              <span className="admin-role">{user?.role ? user.role.toUpperCase() : 'Pegawai'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button admin-logout" title="Keluar">
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar glass-panel">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
            <button className="mobile-menu-toggle btn-secondary-admin hide-on-desktop" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="search-bar" style={{ flex: 1 }}>
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Cari data siswa, ujian, staf..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
            </div>
          </div>
          <div className="topbar-actions">
            <button className="btn-primary-admin" onClick={() => setActiveTab('add-exam')}>
              <Plus size={18} />
              <span>Buat Ujian Baru</span>
            </button>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view fade-in">
            <div className="view-header">
              <h1>Ringkasan Sistem</h1>
              <p>Pantau aktivitas dan statistik terkini.</p>
            </div>

            {/* Overview Stats */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card glass-panel border-blue">
                <div className="stat-content">
                  <p>Total Siswa Terdaftar</p>
                  <h3>{students.length}</h3>
                </div>
                <div className="stat-icon bg-blue">
                  <Users size={24} />
                </div>
              </div>
              <div className="admin-stat-card glass-panel border-purple">
                <div className="stat-content">
                  <p>Total Ujian Aktif</p>
                  <h3>{exams.length}</h3>
                </div>
                <div className="stat-icon bg-purple">
                  <BookOpen size={24} />
                </div>
              </div>
              <div className="admin-stat-card glass-panel border-green">
                <div className="stat-content">
                  <p>Rata-rata Nilai Siswa</p>
                  <h3>{avgScore}</h3>
                </div>
                <div className="stat-icon bg-green">
                  <Activity size={24} />
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="admin-recent-section glass-panel">
              <div className="section-header">
                <h3>Ujian Terkini Dibuat</h3>
                <button className="text-button">Lihat Semua</button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Ujian</th>
                      <th>Mata Pelajaran</th>
                      <th>Durasi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.slice(0, 5).map(exam => (
                      <tr key={exam.id}>
                        <td className="font-semibold">{exam.title}</td>
                        <td>{exam.subject}</td>
                        <td>{exam.duration} Menit</td>
                        <td><span className={`badge badge-${exam.status === 'Aktif' ? 'active' : 'draft'}`}>{exam.status}</span></td>
                        <td>
                          <button className="action-btn" onClick={() => {
                            setEditingExamId(exam.id);
                            setNewExam({
                              title: exam.title,
                              subject: exam.subject,
                              duration: exam.duration,
                              questions: exam.questions ? exam.questions.map(q => ({
                                ...q,
                                options: [...(q.options || []), '', '', '', '', ''].slice(0, 5)
                              })) : [],
                              shuffle_questions: exam.shuffle_questions || false,
                              shuffle_options: exam.shuffle_options || false,
                              start_time: exam.start_time || '',
                              end_time: exam.end_time || '',
                              show_discussion: exam.show_discussion || false
                            });
                            setActiveTab('add-exam');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} title="Edit Ujian">
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredExams.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada ujian.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Exam View */}
        {activeTab === 'add-exam' && ['admin', 'guru'].includes(user?.role) && (
          <div className="add-exam-view fade-in">
            <div className="view-header flex-between">
              <div>
                <button className="back-btn" onClick={() => setActiveTab('exams')}>
                  <ArrowLeft size={18} />
                  <span>Kembali</span>
                </button>
                <h1>{editingExamId ? 'Edit Data Ujian' : 'Buat Ujian Baru'}</h1>
                <p>Silakan isi detail ujian dan tambahkan pertanyaan.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editingExamId && (
                  <button className="btn-secondary-admin" onClick={() => {
                    setEditingExamId(null);
                    setNewExam({ title: '', subject: '', duration: '', questions: [], shuffle_questions: false, shuffle_options: false, start_time: '', end_time: '', show_discussion: false });
                    setActiveTab('exams');
                  }}>Batal Edit</button>
                )}
                <button className="btn-primary-admin" onClick={handleSaveExam}>
                  <Save size={18} />
                  <span>{editingExamId ? 'Simpan Perubahan' : 'Simpan Ujian'}</span>
                </button>
              </div>
            </div>

            <div className="exam-form-container glass-panel">
              <div className="form-grid">
                <div className="form-group-admin">
                  <label>Nama Ujian</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ujian Tengah Semester"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </div>
                <div className="form-group-admin">
                  <label>Mata Pelajaran</label>
                  <input
                    type="text"
                    placeholder="Contoh: Matematika"
                    value={newExam.subject}
                    onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
                  />
                </div>
                <div className="form-group-admin">
                  <label>Durasi (Menit)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 60"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                  />
                </div>
                <div className="form-group-admin">
                  <label>Waktu Buka Ujian (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={newExam.start_time}
                    onChange={(e) => setNewExam({ ...newExam, start_time: e.target.value })}
                  />
                </div>
                <div className="form-group-admin">
                  <label>Waktu Tutup Ujian (Opsional)</label>
                  <input
                    type="datetime-local"
                    value={newExam.end_time}
                    onChange={(e) => setNewExam({ ...newExam, end_time: e.target.value })}
                  />
                </div>
                <div className="form-group-admin">
                  <label>Kelompok Peserta (Opsional)</label>
                  <select
                    value={newExam.group_id}
                    onChange={(e) => setNewExam({ ...newExam, group_id: e.target.value })}
                    style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-light)', fontFamily: 'inherit' }}
                  >
                    <option value="">-- Semua / Tidak Dibatasi --</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id} style={{ color: 'black' }}>{g.name}{g.members?.length ? ` (${g.members.length} siswa)` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group-admin">
                  <label>Ruangan Ujian (Opsional)</label>
                  <select
                    value={newExam.room_id}
                    onChange={(e) => setNewExam({ ...newExam, room_id: e.target.value })}
                    style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-light)', fontFamily: 'inherit' }}
                  >
                    <option value="">-- Tidak Ditentukan --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id} style={{ color: 'black' }}>{r.room_name} ({r.room_code}) - Kap. {r.capacity}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-grid" style={{ marginTop: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="form-group-admin" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="shuffle_questions"
                    checked={newExam.shuffle_questions}
                    onChange={(e) => setNewExam({ ...newExam, shuffle_questions: e.target.checked })}
                    style={{ width: '20px', height: '20px', margin: 0 }}
                  />
                  <label htmlFor="shuffle_questions" style={{ margin: 0, cursor: 'pointer' }}>Acak Urutan Soal tiap Siswa</label>
                </div>
                <div className="form-group-admin" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="shuffle_options"
                    checked={newExam.shuffle_options}
                    onChange={(e) => setNewExam({ ...newExam, shuffle_options: e.target.checked })}
                    style={{ width: '20px', height: '20px', margin: 0 }}
                  />
                  <label htmlFor="shuffle_options" style={{ margin: 0, cursor: 'pointer' }}>Acak Pilihan Jawaban (A,B,C,D)</label>
                </div>
                <div className="form-group-admin" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="show_discussion"
                    checked={newExam.show_discussion}
                    onChange={(e) => setNewExam({ ...newExam, show_discussion: e.target.checked })}
                    style={{ width: '20px', height: '20px', margin: 0 }}
                  />
                  <label htmlFor="show_discussion" style={{ margin: 0, cursor: 'pointer' }}>Izinkan Siswa Melihat Pembahasan Pascaujian</label>
                </div>
              </div>
            </div>

            <div className="questions-section">
              <div className="section-header">
                <h3>Daftar Pertanyaan</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary-admin" onClick={() => setShowBankModal(true)} style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}>
                    <Archive size={16} />
                    <span>Pilih dari Bank</span>
                  </button>
                  <button className="btn-secondary-admin" onClick={handleAddQuestion}>
                    <Plus size={16} />
                    <span>Tambah Kosong</span>
                  </button>
                </div>
              </div>

              {newExam.questions.length === 0 ? (
                <div className="empty-questions glass-panel">
                  <p>Belum ada pertanyaan. Silakan klik "Tambah Pertanyaan" untuk memulai.</p>
                </div>
              ) : (
                <div className="questions-list">
                  {newExam.questions.map((q, qIndex) => (
                    <div key={q.id} className="question-card glass-panel">
                      <div className="question-card-header">
                        <h4>Pertanyaan {qIndex + 1}</h4>
                        <button className="btn-danger-icon" onClick={() => handleRemoveQuestion(qIndex)} title="Hapus Pertanyaan">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="form-group-admin">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}>Teks Pertanyaan</label>
                          <label style={{ cursor: 'pointer', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#3b82f6', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UploadCloud size={12} /> Sisipkan Gambar
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const url = await handleImageUpload(file);
                              if (url) handleQuestionChange(qIndex, 'imageUrl', url);
                            }} />
                          </label>
                        </div>
                        {q.imageUrl && (
                           <div style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
                              <img src={q.imageUrl} alt="Pertanyaan" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                              <button onClick={() => handleQuestionChange(qIndex, 'imageUrl', '')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                           </div>
                        )}
                        <textarea
                          placeholder="Tulis pertanyaan di sini..."
                          value={q.text}
                          onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="options-grid">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className={`option-input-wrapper ${q.correctOption === optIndex ? 'is-correct' : ''}`} style={{ flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                              <input
                                type="radio"
                                name={`correct-option-${qIndex}`}
                                checked={q.correctOption === optIndex}
                                onChange={() => handleQuestionChange(qIndex, 'correctOption', optIndex)}
                                title="Pilih sebagai jawaban benar"
                              />
                              <div className="option-letter">{String.fromCharCode(65 + optIndex)}</div>
                              <input
                                type="text"
                                style={{ flex: 1 }}
                                placeholder={`Opsi ${String.fromCharCode(65 + optIndex)}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                              />
                              <label style={{ cursor: 'pointer', marginLeft: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center' }} title="Sisipkan Gambar Opsi">
                                <UploadCloud size={18} />
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  const url = await handleImageUpload(file);
                                  if (url) handleExamOptionImageChange(qIndex, optIndex, url);
                                }} />
                              </label>
                            </div>
                            {q.optionImages && q.optionImages[optIndex] && (
                               <div style={{ width: '100%', marginLeft: '50px', marginTop: '8px', position: 'relative', display: 'inline-block' }}>
                                  <img src={q.optionImages[optIndex]} alt={`Opsi ${String.fromCharCode(65 + optIndex)}`} style={{ maxHeight: '80px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                  <button onClick={() => handleExamOptionImageChange(qIndex, optIndex, '')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                               </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeTab === 'analytics' && ['admin', 'guru'].includes(user?.role) && (
          <div className="dashboard-view fade-in">
            <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1>Laporan & Analitik Nilai</h1>
                <p>Rekapitulasi pencapaian siswa per mata pelajaran</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  className="admin-select"
                  value={analyticsExamId}
                  onChange={(e) => setAnalyticsExamId(e.target.value)}
                  style={{ padding: '10px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '10px', color: 'var(--text-light)', fontFamily: 'inherit', fontWeight: '500' }}
                >
                  <option value="all" style={{ color: 'black' }}>Semua Ujian</option>
                  {uniqueAnalyticsExams.map(ex => (
                    <option key={ex.id} value={ex.id} style={{ color: 'black' }}>{ex.title} - {ex.subject}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary-admin" onClick={handleRefreshAnalytics} disabled={analyticsRefreshing} title="Tarik Data Terbaru" style={{ padding: '10px 14px', borderColor: '#38bdf8', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={16} style={{ animation: analyticsRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                    <span className="hide-on-mobile">{analyticsRefreshing ? 'Memuat...' : 'Tarik Data'}</span>
                  </button>
                  <button className="btn-secondary-admin" onClick={() => navigate('/leaderboard')} title="Papan Peringkat Top 10" style={{ padding: '10px 16px', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(251, 191, 36, 0.02))', borderColor: '#fbbf24', color: '#fbbf24', fontWeight: 'bold' }}>
                    <Trophy size={18} />
                    <span className="hide-on-mobile" style={{ marginLeft: '4px' }}>Peringkat</span>
                  </button>
                  <button className="btn-secondary-admin" onClick={exportToCSV} title="Export CSV" style={{ padding: '10px' }}>
                    <Download size={18} />
                  </button>
                  <button className="btn-secondary-admin" onClick={exportToExcel} title="Export Excel" style={{ padding: '10px', borderColor: '#10b981', color: '#10b981' }}>
                    <FileSpreadsheet size={18} />
                  </button>
                  <button className="btn-secondary-admin" onClick={exportToPDF} title="Export PDF" style={{ padding: '10px', borderColor: '#ef4444', color: '#ef4444' }}>
                    <FileText size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="admin-stat-card glass-panel border-purple">
                <div className="stat-content">
                  <p>Jumlah Peserta</p>
                  <h3>{anTotalPeserta} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>Orang</span></h3>
                </div>
              </div>
              <div className="admin-stat-card glass-panel border-blue">
                <div className="stat-content">
                  <p>Nilai Rata-rata</p>
                  <h3>{anRataRata}</h3>
                </div>
              </div>
              <div className="admin-stat-card glass-panel border-green">
                <div className="stat-content">
                  <p>Tertinggi</p>
                  <h3 style={{ color: '#10b981' }}>{anMax}</h3>
                </div>
              </div>
              <div className="admin-stat-card glass-panel border-red" style={{ borderBottom: '3px solid #ef4444' }}>
                <div className="stat-content">
                  <p>Terendah</p>
                  <h3 style={{ color: '#ef4444' }}>{anMin}</h3>
                </div>
              </div>
            </div>

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Ujian</th>
                      <th>Mata Pelajaran</th>
                      <th>Peserta</th>
                      <th>Rata-rata</th>
                      <th>Tertinggi / Terendah</th>
                      <th>Lulus</th>
                      <th>Export</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {examAnalyticsGroups.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada hasil ujian yang terekam.</td></tr>
                    )}
                    {examAnalyticsGroups.map((eg) => (
                      <React.Fragment key={eg.examId}>
                        <tr
                          style={{ cursor: 'pointer', background: expandedAnalyticsExamId === eg.examId ? 'rgba(59,130,246,0.07)' : undefined }}
                          onClick={() => setExpandedAnalyticsExamId(prev => prev === eg.examId ? null : eg.examId)}
                        >
                          <td className="font-semibold">{eg.examTitle}</td>
                          <td>{eg.subject}</td>
                          <td>{eg.total} orang</td>
                          <td>
                            <div className={`badge`} style={{ background: eg.avg >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: eg.avg >= 70 ? '#10b981' : '#ef4444', display: 'inline-block', padding: '4px 10px', borderRadius: '8px' }}>
                              {eg.avg}
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                            <span style={{ color: '#10b981' }}>{eg.max}</span> / <span style={{ color: '#ef4444' }}>{eg.min}</span>
                          </td>
                          <td>{eg.passed} / {eg.total}</td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button title="Export Excel ujian ini" onClick={() => exportExamToExcel(eg)} style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem' }}>
                                <FileSpreadsheet size={13} /> XLS
                              </button>
                              <button title="Export PDF ujian ini" onClick={() => exportExamToPDF(eg)} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem' }}>
                                <FileText size={13} /> PDF
                              </button>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {expandedAnalyticsExamId === eg.examId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                        </tr>
                        {expandedAnalyticsExamId === eg.examId && eg.records.map((h, i) => (
                          <tr key={i} style={{ background: 'rgba(255,255,255,0.015)', borderLeft: '3px solid rgba(59,130,246,0.4)' }}>
                            <td style={{ paddingLeft: '28px', color: 'var(--text-light)' }}>
                              <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>â†³</span>
                              {h.studentName || 'Anonim'}
                              <span style={{ marginLeft: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                                {students.find(s => s.name === h.studentName)?.nis || '-'}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</td>
                            <td>-</td>
                            <td>
                              <div style={{ background: h.score >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: h.score >= 70 ? '#10b981' : '#ef4444', display: 'inline-block', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
                                {h.score}
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{h.correctAnswers} / {h.totalQuestions} soal</td>
                            <td>
                              <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', background: h.score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: h.score >= 70 ? '#10b981' : '#ef4444' }}>
                                {h.status || (h.score >= 70 ? 'Lulus' : 'Gagal')}
                              </div>
                            </td>
                            <td></td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {new Date(h.date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Live Record View */}
        {activeTab === 'live-record' && user?.role === 'admin' && (
          <div className="dashboard-view fade-in">
            <div className="view-header">
              <h1>Live Record - Pemantauan Ujian</h1>
              <p>Memantau sesi ujian yang sedang berlangsung secara real-time.</p>
            </div>
            <LiveRecord />
          </div>
        )}

        {/* Groups Data View */}
        {activeTab === 'groups-data' && user?.role === 'admin' && (
          <div className="dashboard-view fade-in">
            <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1>Data Kelompok</h1>
                <p>Kelola kelompok peserta ujian untuk pengkoordiniran yang lebih mudah.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-secondary-admin" onClick={downloadGroupTemplate} style={{ borderColor: '#10b981', color: '#10b981', padding: '10px 14px' }}>
                  <Download size={16} /><span className="hide-on-mobile">Template</span>
                </button>
                <label className="btn-secondary-admin" style={{ cursor: 'pointer', margin: 0, padding: '10px 14px', borderColor: '#3b82f6', color: '#3b82f6' }}>
                  <UploadCloud size={16} /><span className="hide-on-mobile">Impor</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handleGroupImport} style={{ display: 'none' }} />
                </label>
                <button className="btn-secondary-admin" onClick={exportGroupsToExcel} style={{ borderColor: '#f59e0b', color: '#f59e0b', padding: '10px 14px' }}>
                  <FileSpreadsheet size={16} /><span className="hide-on-mobile">Ekspor</span>
                </button>
                <button className="btn-primary-admin" onClick={() => { setNewGroup({ name: '', description: '', members: [] }); setEditingGroupId(null); setShowGroupForm(true); }}>
                  <Plus size={18} /><span>Buat Kelompok</span>
                </button>
              </div>
            </div>

            {showGroupForm && (
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>{editingGroupId ? 'Edit Kelompok' : 'Kelompok Baru'}</h3>
                <div className="form-grid">
                  <div className="form-group-admin">
                    <label>Nama Kelompok</label>
                    <input type="text" placeholder="Contoh: Kelompok A, IPA 1" value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} />
                  </div>
                  <div className="form-group-admin">
                    <label>Keterangan (Opsional)</label>
                    <input type="text" placeholder="Contoh: Kelas X ruang 1" value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
                  </div>
                </div>
                <div className="form-group-admin" style={{ marginTop: '16px' }}>
                  <label>Pilih Anggota Kelompok</label>
                  <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {students.length === 0 && <p style={{ color: 'var(--text-muted)', margin: 0 }}>Belum ada data siswa.</p>}
                    {students.map(s => (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 10px', background: newGroup.members.includes(s.nis) ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: newGroup.members.includes(s.nis) ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent', transition: 'all 0.2s' }}>
                        <input
                          type="checkbox"
                          checked={newGroup.members.includes(s.nis)}
                          onChange={(e) => {
                            if (e.target.checked) setNewGroup(prev => ({ ...prev, members: [...prev.members, s.nis] }));
                            else setNewGroup(prev => ({ ...prev, members: prev.members.filter(n => n !== s.nis) }));
                          }}
                          style={{ accentColor: '#3b82f6' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.nis} آ· {s.class}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{newGroup.members.length} siswa dipilih</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="btn-primary-admin" onClick={handleSaveGroup}><Save size={16} /><span>{editingGroupId ? 'Simpan Perubahan' : 'Simpan Kelompok'}</span></button>
                  <button className="btn-secondary-admin" onClick={() => { setShowGroupForm(false); setEditingGroupId(null); }}>Batal</button>
                </div>
              </div>
            )}

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Kelompok</th>
                      <th>Keterangan</th>
                      <th>Jumlah Anggota</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada kelompok yang dibuat.</td></tr>
                    )}
                    {groups.map(g => (
                      <tr key={g.id}>
                        <td className="font-semibold">{g.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{g.description || '-'}</td>
                        <td>
                          <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', borderRadius: '8px', fontWeight: 600 }}>
                            {Array.isArray(g.members) ? g.members.length : 0} siswa
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-secondary-admin" style={{ padding: '6px 10px' }} onClick={() => {
                              setNewGroup({ name: g.name, description: g.description || '', members: Array.isArray(g.members) ? [...g.members] : [] });
                              setEditingGroupId(g.id);
                              setShowGroupForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}><Edit size={15} /></button>
                            <button className="btn-secondary-admin" style={{ padding: '6px 10px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => deleteGroup(g.id)}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Question Bank View */}
        {activeTab === 'question-bank' && ['admin', 'guru'].includes(user?.role) && (
          <div className="dashboard-view fade-in">
            {/* Header */}
            <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                {qBankSelectedSubject ? (
                  <>
                    <button className="back-btn" onClick={() => { setQBankSelectedSubject(null); setQBankSearch(''); setQBankPage(1); setShowBankForm(false); setEditingQuestionId(null); }} style={{ marginBottom: '6px' }}>
                      <ArrowLeft size={16} /> Kembali ke Daftar Mata Pelajaran
                    </button>
                    <h1>{qBankSelectedSubject}</h1>
                    <p>{questions.filter(q => q.subject === qBankSelectedSubject).length} soal tersedia</p>
                  </>
                ) : (
                  <>
                    <h1>Bank Soal Utama</h1>
                    <p>Pilih mata pelajaran untuk mengelola soal-soalnya.</p>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn-secondary-admin" onClick={downloadExcelTemplate} style={{ borderColor: '#10b981', color: '#10b981', padding: '10px 16px' }}>
                  <Download size={18} />
                  <span className="hide-on-mobile">Unduh Template</span>
                </button>
                <label className="btn-secondary-admin" style={{ cursor: 'pointer', margin: 0, padding: '10px 16px', borderColor: '#3b82f6', color: '#3b82f6' }}>
                  <UploadCloud size={18} />
                  <span className="hide-on-mobile">Impor Excel</span>
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelImport} style={{ display: 'none' }} />
                </label>
                <button className="btn-primary-admin" onClick={() => {
                    setEditingQuestionId(null);
                    setNewBankQuestion({ subject: qBankSelectedSubject || '', text: '', options: ['', '', '', '', ''], optionImages: ['', '', '', '', ''], correctOption: 0 });
                    setShowBankForm(!showBankForm);
                  }}>
                    <Plus size={18} />
                    <span className="hide-on-mobile">{showBankForm ? 'Batal' : 'Tambah Soal'}</span>
                  </button>
              </div>
            </div>

            {/* Add/Edit Form */}
            {showBankForm && (
              <div className="admin-recent-section glass-panel fade-in" style={{ marginBottom: '24px' }}>
                <div className="section-header flex-between">
                  <h3>{editingQuestionId ? 'Edit Soal Bank' : 'Penambahan Soal Tunggal (Bank)'}</h3>
                </div>
                <div className="form-group-admin" style={{ marginBottom: '16px' }}>
                  <label>Mata Pelajaran (Subjek)</label>
                  <input type="text" placeholder="Contoh: Matematika" value={newBankQuestion.subject} onChange={e => setNewBankQuestion({ ...newBankQuestion, subject: e.target.value })} />
                </div>
                <div className="form-group-admin" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>Teks Pertanyaan</label>
                    <label style={{ cursor: 'pointer', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#3b82f6', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <UploadCloud size={14} /> Sisipkan Gambar
                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const url = await handleImageUpload(file);
                          if (url) setNewBankQuestion({ ...newBankQuestion, imageUrl: url });
                       }} />
                    </label>
                  </div>
                  {newBankQuestion.imageUrl && (
                     <div style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
                        <img src={newBankQuestion.imageUrl} alt="Pertanyaan" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button onClick={() => setNewBankQuestion({...newBankQuestion, imageUrl: ''})} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                     </div>
                  )}
                  <textarea rows={3} placeholder="Tuliskan isi pertanyaan..." value={newBankQuestion.text} onChange={e => setNewBankQuestion({ ...newBankQuestion, text: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-light)' }} />
                </div>
                <div className="options-grid">
                  {newBankQuestion.options.map((opt, optIndex) => (
                    <div key={optIndex} className={`option-input-wrapper ${newBankQuestion.correctOption === optIndex ? 'is-correct' : ''}`} style={{ flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                        <input type="radio" name="bank-correct-option" checked={newBankQuestion.correctOption === optIndex} onChange={() => setNewBankQuestion({ ...newBankQuestion, correctOption: optIndex })} title="Tandai sebagai jawaban benar" />
                        <div className="option-letter">{String.fromCharCode(65 + optIndex)}</div>
                        <input type="text" style={{ flex: 1 }} placeholder={`Teks Opsi ${String.fromCharCode(65 + optIndex)}`} value={opt} onChange={(e) => { const newOpts = [...newBankQuestion.options]; newOpts[optIndex] = e.target.value; setNewBankQuestion({ ...newBankQuestion, options: newOpts }); }} />
                        <label style={{ cursor: 'pointer', marginLeft: '8px', color: '#3b82f6', display: 'flex', alignItems: 'center' }} title="Sisipkan Gambar Opsi">
                          <UploadCloud size={18} />
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => { const file = e.target.files[0]; if (!file) return; const url = await handleImageUpload(file); if (url) handleBankOptionImageChange(optIndex, url); }} />
                        </label>
                      </div>
                      {newBankQuestion.optionImages && newBankQuestion.optionImages[optIndex] && (
                         <div style={{ width: '100%', marginLeft: '50px', marginTop: '8px', position: 'relative', display: 'inline-block' }}>
                            <img src={newBankQuestion.optionImages[optIndex]} alt={`Opsi ${String.fromCharCode(65 + optIndex)}`} style={{ maxHeight: '80px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                            <button onClick={() => handleBankOptionImageChange(optIndex, '')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}><X size={12} /></button>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px', justifyContent: 'flex-end' }}>
                  {editingQuestionId && (
                    <button className="btn-secondary-admin" onClick={() => { setEditingQuestionId(null); setNewBankQuestion({ subject: qBankSelectedSubject || '', text: '', options: ['', '', '', '', ''], correctOption: 0 }); setShowBankForm(false); }}>Batal Edit</button>
                  )}
                  <button className="btn-primary-admin" onClick={handleSaveBankQuestion}>
                    <Save size={18} /> {editingQuestionId ? 'Simpan Revisi Soal' : 'Simpan Soal ke Bank'}
                  </button>
                </div>
              </div>
            )}

            {/* SUBJECT CARDS â€” shown when no subject selected */}
            {!qBankSelectedSubject && (() => {
              const subjectGroups = questions.reduce((acc, q) => {
                if (!acc[q.subject]) acc[q.subject] = 0;
                acc[q.subject]++;
                return acc;
              }, {});
              const subjectList = Object.entries(subjectGroups).sort((a, b) => a[0].localeCompare(b[0]));
              const subjectColors = ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16'];
              return (
                <div>
                  {subjectList.length === 0 ? (
                    <div className="admin-recent-section glass-panel" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                      <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p>Bank soal masih kosong. Silakan impor dari format Excel (.xlsx).</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                      {subjectList.map(([subject, count], idx) => {
                        const color = subjectColors[idx % subjectColors.length];
                        return (
                          <div
                            key={subject}
                            onClick={() => { setQBankSelectedSubject(subject); setQBankSearch(''); setQBankPage(1); setShowBankForm(false); }}
                            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `4px solid ${color}`, borderRadius: '14px', padding: '20px 20px 18px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '10px' }}
                            onMouseEnter={e => { e.currentTarget.style.background = `rgba(255,255,255,0.06)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-light)', lineHeight: 1.3 }}>{subject}</span>
                              <BookOpen size={18} style={{ color, opacity: 0.7, flexShrink: 0, marginLeft: '8px' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                              <span style={{ fontSize: '2rem', fontWeight: 800, color }}>{count}</span>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>soal</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* QUESTIONS TABLE â€” shown when a subject is selected */}
            {qBankSelectedSubject && (() => {
              const handleQBankSort = (col) => {
                if (qBankSortCol === col) setQBankSortDir(d => d === 'asc' ? 'desc' : 'asc');
                else { setQBankSortCol(col); setQBankSortDir('asc'); }
                setQBankPage(1);
              };
              const SortIcon = ({ col }) => {
                if (qBankSortCol !== col) return <span style={{ opacity: 0.3, fontSize: '0.7rem' }}> â‡…</span>;
                return <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>{qBankSortDir === 'asc' ? ' â†‘' : ' â†“'}</span>;
              };
              let qList = questions.filter(q =>
                q.subject === qBankSelectedSubject &&
                (qBankSearch === '' || q.text.toLowerCase().includes(qBankSearch.toLowerCase()))
              );
              if (qBankSortCol) {
                qList = [...qList].sort((a, b) => {
                  const va = (a[qBankSortCol] || '').toString().toLowerCase();
                  const vb = (b[qBankSortCol] || '').toString().toLowerCase();
                  return qBankSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
                });
              }
              const totalRows = qList.length;
              const totalPages = Math.max(1, Math.ceil(totalRows / qBankPerPage));
              const safePage = Math.min(qBankPage, totalPages);
              const pageStart = (safePage - 1) * qBankPerPage;
              const pagedList = qList.slice(pageStart, pageStart + qBankPerPage);
              return (
                <div className="admin-recent-section glass-panel">
                  {/* Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <span>Tampilkan</span>
                      <select value={qBankPerPage} onChange={e => { setQBankPerPage(Number(e.target.value)); setQBankPage(1); }} style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {[10, 25, 50, 100].map(n => <option key={n} value={n} style={{ color: 'black' }}>{n}</option>)}
                      </select>
                      <span>data</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Cari:</span>
                      <input type="text" value={qBankSearch} onChange={e => { setQBankSearch(e.target.value); setQBankPage(1); }} placeholder="Ketik untuk cari..." style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'var(--text-light)', fontSize: '0.9rem', width: '200px', outline: 'none' }} />
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', width: '1%' }}>#</th>
                          <th style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }} onClick={() => handleQBankSort('text')}>Pertanyaan <SortIcon col="text" /></th>
                          <th>Opsi Jawaban</th>
                          <th style={{ whiteSpace: 'nowrap', width: '1%' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedList.map((q, idx) => (
                          <tr key={q.id}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{pageStart + idx + 1}</td>
                            <td><div style={{ maxHeight: '80px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{q.text}</div></td>
                            <td>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {q.options.map((opt, i) => (
                                  <li key={i} style={{ color: i === q.correctOption ? '#10b981' : 'inherit', fontWeight: i === q.correctOption ? 'bold' : 'normal' }}>
                                    {String.fromCharCode(65 + i)}. {opt}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="action-btn" title="Edit Soal" style={{ color: '#3b82f6' }} onClick={() => {
                                  setEditingQuestionId(q.id);
                                  setNewBankQuestion({ subject: q.subject, text: q.text, imageUrl: q.imageUrl || '', optionImages: [...(q.optionImages || []), '', '', '', '', ''].slice(0, 5), options: [...(q.options || []), '', '', '', '', ''].slice(0, 5), correctOption: typeof q.correctOption !== 'undefined' ? q.correctOption : 0 });
                                  setShowBankForm(true);
                                  window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}><Edit size={16} /></button>
                                <button className="action-btn" title="Hapus Permanen" onClick={() => deleteQuestion(q.id)}><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {pagedList.length === 0 && (
                          <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>{qBankSearch ? 'Tidak ada soal yang cocok dengan pencarian.' : 'Belum ada soal untuk mata pelajaran ini.'}</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {totalRows === 0 ? 'Tidak ada data' : `Menampilkan ${pageStart + 1}â€“${Math.min(pageStart + qBankPerPage, totalRows)} dari ${totalRows} data`}
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[{label:'آ«',fn:()=>setQBankPage(1)},{label:'â€¹',fn:()=>setQBankPage(p=>Math.max(1,p-1))}].map(b=><button key={b.label} onClick={b.fn} disabled={safePage===1} style={{padding:'5px 10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',color:safePage===1?'var(--text-muted)':'var(--text-light)',cursor:safePage===1?'not-allowed':'pointer'}}>{b.label}</button>)}
                      {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-safePage)<=2).reduce((acc,p,idx,arr)=>{if(idx>0&&p-arr[idx-1]>1)acc.push('...');acc.push(p);return acc;},[]).map((p,idx)=>
                        p==='...'?<span key={`e${idx}`} style={{padding:'5px 8px',color:'var(--text-muted)'}}>â€¦</span>:
                        <button key={p} onClick={()=>setQBankPage(p)} style={{padding:'5px 10px',background:p===safePage?'rgba(14,165,233,0.3)':'rgba(255,255,255,0.05)',border:`1px solid ${p===safePage?'#0ea5e9':'rgba(255,255,255,0.1)'}`,borderRadius:'6px',color:p===safePage?'#38bdf8':'var(--text-light)',cursor:'pointer',fontWeight:p===safePage?700:400}}>{p}</button>
                      )}
                      {[{label:'â€؛',fn:()=>setQBankPage(p=>Math.min(totalPages,p+1))},{label:'آ»',fn:()=>setQBankPage(totalPages)}].map(b=><button key={b.label} onClick={b.fn} disabled={safePage===totalPages} style={{padding:'5px 10px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'6px',color:safePage===totalPages?'var(--text-muted)':'var(--text-light)',cursor:safePage===totalPages?'not-allowed':'pointer'}}>{b.label}</button>)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Exams Management View */}
        {activeTab === 'exams' && ['admin', 'guru'].includes(user?.role) && (
          <div className="dashboard-view fade-in">
            <div className="view-header flex-between">
              <div>
                <h1>Manajemen Ujian</h1>
                <p>Kelola semua ujian, termasuk status dan materi yang telah dibuat.</p>
              </div>
              <button className="btn-primary-admin" onClick={() => setActiveTab('add-exam')}>
                <Plus size={18} />
                <span>Buat Ujian Baru</span>
              </button>
            </div>

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Ujian</th>
                      <th>Mata Pelajaran</th>
                      <th>Durasi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map(exam => (
                      <tr key={exam.id}>
                        <td className="font-semibold">{exam.title}</td>
                        <td>{exam.subject}</td>
                        <td>{exam.duration} Menit</td>
                        <td><span className={`badge badge-${exam.status === 'Aktif' ? 'active' : 'draft'}`}>{exam.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="action-btn" title="Edit Ujian" onClick={() => {
                              setEditingExamId(exam.id);
                              setNewExam({
                                title: exam.title,
                                subject: exam.subject,
                                duration: exam.duration,
                                questions: exam.questions || [],
                                shuffle_questions: exam.shuffle_questions || false,
                                shuffle_options: exam.shuffle_options || false,
                                start_time: exam.start_time || '',
                                end_time: exam.end_time || '',
                                show_discussion: exam.show_discussion || false
                              });
                              setActiveTab('add-exam');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} style={{ color: '#3b82f6' }}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn" title="Hapus" onClick={() => deleteExam(exam.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredExams.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada ujian.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Students Management View */}
        {activeTab === 'students' && ['admin', 'guru', 'TU'].includes(user?.role) && (
          <div className="dashboard-view fade-in">
            <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1>Manajemen Siswa</h1>
                <p>Kelola data siswa yang terdaftar di dalam sistem ujian.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary-admin" onClick={downloadStudentExcelTemplate} style={{ borderColor: '#10b981', color: '#10b981', padding: '10px 16px' }} title="Unduh Template Excel">
                  <Download size={18} />
                  <span className="hide-on-mobile">Unduh Template</span>
                </button>
                <label className="btn-secondary-admin" style={{ cursor: 'pointer', margin: 0, padding: '10px 16px', borderColor: '#3b82f6', color: '#3b82f6' }} title="Impor data massal dari Excel">
                  <UploadCloud size={18} />
                  <span className="hide-on-mobile">Impor Massal</span>
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleStudentExcelImport} style={{ display: 'none' }} />
                </label>
                <button className="btn-primary-admin" onClick={() => {
                  setEditingStudentId(null);
                  setNewStudent({ nis: '', name: '', class: '', password: '' });
                  setShowStudentForm(!showStudentForm);
                }}>
                  <Plus size={18} />
                  <span className="hide-on-mobile">{showStudentForm ? 'Batal' : 'Tambah Baru'}</span>
                </button>
              </div>
            </div>

            {showStudentForm && (
              <div className="admin-recent-section glass-panel" style={{ marginBottom: '24px' }}>
                <div className="section-header flex-between">
                  <h3>{editingStudentId ? 'Edit Data Siswa' : 'Pendaftaran Siswa Baru'}</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group-admin">
                    <label>NIS (Nomor Induk Siswa)</label>
                    <input type="text" placeholder="Contoh: 10123" value={newStudent.nis} onChange={e => setNewStudent({ ...newStudent, nis: e.target.value })} />
                  </div>
                  <div className="form-group-admin">
                    <label>Nama Lengkap</label>
                    <input type="text" placeholder="Contoh: Budi Santoso" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                  </div>
                  <div className="form-group-admin">
                    <label>Kelas</label>
                    <input type="text" placeholder="Contoh: 12 IPA 1" value={newStudent.class} onChange={e => setNewStudent({ ...newStudent, class: e.target.value })} />
                  </div>
                  <div className="form-group-admin">
                    <label>Kata Sandi Masuk</label>
                    <input type="text" placeholder="Sandi ujian" value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {editingStudentId && (
                    <button className="btn-secondary-admin" onClick={() => {
                      setEditingStudentId(null);
                      setNewStudent({ nis: '', name: '', class: '', password: '' });
                      setShowStudentForm(false);
                    }}>Batal Edit</button>
                  )}
                  <button className="btn-primary-admin" onClick={handleSaveStudent}>
                    <Save size={18} /> {editingStudentId ? 'Simpan Perubahan' : 'Simpan Data Siswa'}
                  </button>
                </div>
              </div>
            )}

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NIS</th>
                      <th>Nama Lengkap</th>
                      <th>Kelas</th>
                      <th>Status Akun</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(std => (
                      <tr key={std.id}>
                        <td className="font-semibold">{std.nis}</td>
                        <td>{std.name}</td>
                        <td>{std.class}</td>
                        <td><span className={`badge badge-${std.status === 'Aktif' ? 'active' : 'draft'}`}>{std.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="action-btn" title="Edit" style={{ color: '#3b82f6' }} onClick={() => {
                              setEditingStudentId(std.id);
                              setNewStudent({ nis: std.nis, name: std.name, class: std.class, password: '' });
                              setShowStudentForm(true);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn" title="Hapus" onClick={() => deleteStudent(std.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada siswa yang didaftarkan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Staff/Pegawai Management View (ADMIN ONLY) */}
        {activeTab === 'staff' && user?.role === 'admin' && (
          <div className="dashboard-view fade-in">
            <div className="view-header flex-between">
              <div>
                <h1>Manajemen Pegawai Internal</h1>
                <p>Kelola data guru, tata usaha, dan pengawas sekolah (Staf).</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-secondary-admin" onClick={downloadStaffTemplate} style={{ borderColor: '#10b981', color: '#10b981', padding: '10px 14px' }}>
                  <Download size={16} /><span className="hide-on-mobile">Template</span>
                </button>
                <label className="btn-secondary-admin" style={{ cursor: 'pointer', margin: 0, padding: '10px 14px', borderColor: '#3b82f6', color: '#3b82f6' }}>
                  <UploadCloud size={16} /><span className="hide-on-mobile">Impor</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handleStaffImport} style={{ display: 'none' }} />
                </label>
                <button className="btn-secondary-admin" onClick={exportStaffToExcel} style={{ borderColor: '#f59e0b', color: '#f59e0b', padding: '10px 14px' }}>
                  <FileSpreadsheet size={16} /><span className="hide-on-mobile">Ekspor</span>
                </button>
                <button className="btn-primary-admin" onClick={() => {
                  setEditingStaffId(null);
                  setNewStaff({ username: '', name: '', role: 'guru', password: '' });
                  setShowStaffForm(!showStaffForm);
                }}>
                  <Plus size={18} />
                  <span>{showStaffForm ? 'Batal Tambah' : 'Rekrut Pegawai Baru'}</span>
                </button>
              </div>
            </div>

            {showStaffForm && (
              <div className="admin-recent-section glass-panel" style={{ marginBottom: '24px' }}>
                <div className="section-header flex-between">
                  <h3>{editingStaffId ? 'Revisi Hak Akses Pegawai' : 'Sistem Rekrutmen / Penugasan Pegawai'}</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group-admin">
                    <label>Nama Pengguna (Username Login)</label>
                    <input type="text" placeholder="Contoh: guru.budi" value={newStaff.username} onChange={e => setNewStaff({ ...newStaff, username: e.target.value })} />
                  </div>
                  <div className="form-group-admin">
                    <label>Nama Tampilan / Gelar</label>
                    <input type="text" placeholder="Contoh: Budi Santoso, S.Pd" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} />
                  </div>
                  <div className="form-group-admin">
                    <label>Peran Tanggung Jawab</label>
                    <select className="admin-select" value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })} style={{ width: '100%', padding: '12px 16px', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: 'var(--text-light)', fontFamily: 'inherit' }}>
                      <option value="admin" style={{ color: 'black' }}>Super Admin</option>
                      <option value="guru" style={{ color: 'black' }}>Guru (Pengampu Ujian)</option>
                      <option value="pengawas" style={{ color: 'black' }}>Pengawas Ruang</option>
                      <option value="TU" style={{ color: 'black' }}>Staff Administrasi / TU</option>
                    </select>
                  </div>
                  <div className="form-group-admin">
                    <label>Kata Sandi Utama</label>
                    <input type="text" placeholder={editingStaffId ? 'Kosongkan jika tidak ubah sandi' : 'Sandi sementara'} value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {editingStaffId && (
                    <button className="btn-secondary-admin" onClick={() => {
                      setEditingStaffId(null);
                      setNewStaff({ username: '', name: '', role: 'guru', password: '' });
                      setShowStaffForm(false);
                    }}>Batal Edit</button>
                  )}
                  <button className="btn-primary-admin" onClick={handleSaveStaff}>
                    <Save size={18} /> {editingStaffId ? 'Simpan Revisi Akses' : 'Daftarkan Hak Akses Pegawai'}
                  </button>
                </div>
              </div>
            )}

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Pengguna (Username)</th>
                      <th>Nama Tampilan</th>
                      <th>Posisi / Wewenang</th>
                      <th>Status Kontrak</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map(st => (
                      <tr key={st.id}>
                        <td className="font-semibold">{st.username}</td>
                        <td>{st.name}</td>
                        <td><span className="badge badge-active" style={{ background: st.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: st.role === 'admin' ? '#ef4444' : '#10b981', display: 'inline-block', padding: '4px 12px', borderRadius: '50px' }}>{st.role.toUpperCase()}</span></td>
                        <td><span className={`badge badge-${st.status === 'Aktif' ? 'active' : 'draft'}`}>{st.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="action-btn" title="Edit Akses" style={{ color: '#3b82f6' }} onClick={() => {
                              setEditingStaffId(st.id);
                              setNewStaff({ username: st.username, name: st.name, role: st.role, password: '' });
                              setShowStaffForm(true);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn" title="Blokir & Hapus" onClick={() => deleteStaff(st.id)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStaff.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada data staf/pegawai direkrut.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings Management View */}
        {activeTab === 'settings' && (
          <div className="dashboard-view fade-in">
            <div className="view-header">
              <h1>Keamanan & Profil Akun</h1>
              <p>Perbarui identitas pribadi Anda beserta kata sandi masuk.</p>
            </div>

            <div className="admin-recent-section glass-panel" style={{ maxWidth: '600px' }}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                <div className="form-group-admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '2px dashed rgba(255,255,255,0.2)' }}>
                    {profileSettings.avatar_url ? (
                      <img src={profileSettings.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar Preview" />
                    ) : (
                      <Users size={40} style={{ opacity: 0.3 }} />
                    )}
                  </div>
                  <label htmlFor="avatar-upload" className="btn-secondary-admin" style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Pilih Foto Baru (Maks 1MB)
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleProfileImageChange} style={{ display: 'none' }} />
                </div>

                <div className="form-group-admin">
                  <label>Nama Pengguna / Tampilan</label>
                  <input type="text" value={profileSettings.name} onChange={e => setProfileSettings({ ...profileSettings, name: e.target.value })} placeholder="Contoh: Budi Susanto" />
                </div>

                <div className="form-group-admin">
                  <label>Ubah Kata Sandi</label>
                  <input type="text" value={profileSettings.password} onChange={e => setProfileSettings({ ...profileSettings, password: e.target.value })} placeholder="Kosongkan jika tidak ingin mengubah sandi" />
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button className="btn-primary-admin" onClick={handleSaveProfile} style={{ width: '100%', justifyContent: 'center' }}>
                    <Save size={18} />
                    <span>Terapkan Profil Baru</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="admin-recent-section glass-panel" style={{ maxWidth: '600px', marginTop: '24px', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                <h3 style={{ margin: 0, color: '#ef4444', fontSize: '1rem', fontWeight: 700 }}>Zona Berbahaya</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', lineHeight: 1.6 }}>
                Menghapus akun akan <strong style={{ color: '#f87171' }}>memusnahkan secara permanen</strong> seluruh data Anda â€” ujian, soal, siswa, kelas, ruangan, sekolah, riwayat, dan semua staf yang terdaftar di bawah akun ini. Tindakan ini tidak dapat dipulihkan.
              </p>
              <button
                onClick={deleteAllAdminData}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
              >
                <Trash2 size={18} />
                <span>Hapus Akun &amp; Semua Data Saya</span>
              </button>
            </div>
          </div>
        )}

        {/* Multi-School Management View */}
        {activeTab === 'school-data' && ['admin', 'TU'].includes(user?.role) && (
          <div className="school-data-view fade-in">
            <div className="view-header flex-between">
              <div>
                <h1>Manajemen Data Lembaga</h1>
                <p>Kelola profil institusi atau lembaga yang berlangganan pada platform Anda.</p>
              </div>
              <button className="btn-primary-admin" onClick={() => {
                setEditingSchoolId(null);
                setNewSchool({ name: '', npsn: '', address: '', principal: '', phone: '', status: 'Aktif' });
                setShowSchoolForm(!showSchoolForm);
              }}>
                {showSchoolForm ? 'Tutup Formulir' : 'Tambah Institusi'}
              </button>
            </div>

            {showSchoolForm && (
              <div className="admin-recent-section glass-panel fade-in" style={{ marginBottom: '24px' }}>
                <div className="form-grid">
                  <div className="form-group-admin">
                    <label>Nama Institusi / Lembaga</label>
                    <input type="text" value={newSchool.name} onChange={e => setNewSchool({ ...newSchool, name: e.target.value })} placeholder="Contoh: SMA Negeri 1 / Universitas Tunas..." />
                  </div>
                  <div className="form-group-admin">
                    <label>NPSN / Nomor Induk Lembaga</label>
                    <input type="text" value={newSchool.npsn} onChange={e => setNewSchool({ ...newSchool, npsn: e.target.value })} placeholder="Nomor unik identitas institusi" />
                  </div>
                  <div className="form-group-admin" style={{ gridColumn: '1 / -1' }}>
                    <label>Alamat Lengkap</label>
                    <textarea value={newSchool.address} onChange={e => setNewSchool({ ...newSchool, address: e.target.value })} placeholder="Alamat jalan, kelurahan, kecamatan, kota..." rows={3} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-light)' }} />
                  </div>
                  <div className="form-group-admin">
                    <label>Nama Pimpinan / Kepala Lembaga</label>
                    <input type="text" value={newSchool.principal} onChange={e => setNewSchool({ ...newSchool, principal: e.target.value })} placeholder="Nama lengkap serta gelar pimpinan" />
                  </div>
                  <div className="form-group-admin">
                    <label>Telepon / Kontak</label>
                    <input type="text" value={newSchool.phone} onChange={e => setNewSchool({ ...newSchool, phone: e.target.value })} placeholder="Nomor Telepon/Email" />
                  </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button className="btn-secondary-admin" onClick={() => {
                    setShowSchoolForm(false);
                    setEditingSchoolId(null);
                    setNewSchool({ name: '', npsn: '', address: '', principal: '', phone: '', status: 'Aktif' });
                  }}>Batal</button>
                  <button className="btn-primary-admin" onClick={handleSaveSchool}>
                    <Save size={18} />
                    <span>{editingSchoolId ? 'Simpan Perubahan' : 'Daftarkan Institusi'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NPSN</th>
                      <th>Nama Institusi</th>
                      <th>Kepala Sekolah</th>
                      <th>Status & Kontak</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.length > 0 ? (
                      filteredSchools.map((school) => (
                        <tr key={school.id}>
                          <td className="font-semibold">{school.npsn}</td>
                          <td>
                            <strong>{school.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{school.address}</div>
                          </td>
                          <td>{school.principal || '-'}</td>
                          <td>
                            <span className={`badge badge-${school.status === 'Aktif' ? 'active' : 'draft'}`}>{school.status}</span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{school.phone}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="action-btn" onClick={() => {
                                setEditingSchoolId(school.id);
                                setNewSchool({ name: school.name, npsn: school.npsn, address: school.address, principal: school.principal, phone: school.phone, status: school.status });
                                setShowSchoolForm(true);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }} title="Edit Institusi" style={{ color: '#3b82f6' }}>
                                <Edit size={16} />
                              </button>
                              <button className="btn-danger-icon" onClick={() => deleteSchool(school.id)} title="Cabut Institusi">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Belum ada institusi terdaftar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Room Data View */}
        {activeTab === 'rooms-data' && ['admin', 'TU', 'guru'].includes(user?.role) && (
          <div className="school-data-view fade-in">
            <div className="view-header flex-between">
              <div>
                <h1>Manajemen Ruang Ujian</h1>
                <p>Kelola kapasitas dan ketersediaan lokasi fisik pelaksanaan ujian.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-secondary-admin" onClick={downloadRoomTemplate} style={{ borderColor: '#10b981', color: '#10b981', padding: '10px 14px' }}>
                  <Download size={16} /><span className="hide-on-mobile">Template</span>
                </button>
                <label className="btn-secondary-admin" style={{ cursor: 'pointer', margin: 0, padding: '10px 14px', borderColor: '#3b82f6', color: '#3b82f6' }}>
                  <UploadCloud size={16} /><span className="hide-on-mobile">Impor</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handleRoomImport} style={{ display: 'none' }} />
                </label>
                <button className="btn-secondary-admin" onClick={exportRoomsToExcel} style={{ borderColor: '#f59e0b', color: '#f59e0b', padding: '10px 14px' }}>
                  <FileSpreadsheet size={16} /><span className="hide-on-mobile">Ekspor</span>
                </button>
                <button className="btn-primary-admin" onClick={() => {
                  setEditingRoomId(null);
                  setNewRoom({ room_code: '', room_name: '', capacity: 30, status: 'Tersedia' });
                  setShowRoomForm(!showRoomForm);
                }}>
                  {showRoomForm ? 'Tutup Formulir' : 'Tambah Ruangan'}
                </button>
              </div>
            </div>

            {showRoomForm && (
              <div className="admin-recent-section glass-panel fade-in" style={{ marginBottom: '24px' }}>
                <div className="form-grid">
                  <div className="form-group-admin">
                    <label>Kode Ruangan (Unik)</label>
                    <input type="text" value={newRoom.room_code} onChange={e => setNewRoom({ ...newRoom, room_code: e.target.value })} placeholder="Contoh: LAB-01" />
                  </div>
                  <div className="form-group-admin">
                    <label>Nama Ruangan</label>
                    <input type="text" value={newRoom.room_name} onChange={e => setNewRoom({ ...newRoom, room_name: e.target.value })} placeholder="Contoh: Laboratorium Komputer 1" />
                  </div>
                  <div className="form-group-admin">
                    <label>Kapasitas (Jumlah Peserta)</label>
                    <input type="number" value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 0 })} placeholder="Contoh: 30" />
                  </div>
                  <div className="form-group-admin">
                    <label>Status Ruangan</label>
                    <select value={newRoom.status} onChange={e => setNewRoom({ ...newRoom, status: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-light)', outline: 'none' }}>
                      <option value="Tersedia" style={{ color: 'black' }}>Tersedia</option>
                      <option value="Pemeliharaan" style={{ color: 'black' }}>Pemeliharaan</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button className="btn-secondary-admin" onClick={() => {
                    setShowRoomForm(false);
                    setEditingRoomId(null);
                    setNewRoom({ room_code: '', room_name: '', capacity: 30, status: 'Tersedia' });
                  }}>Batal</button>
                  <button className="btn-primary-admin" onClick={handleSaveRoom}>
                    <Save size={18} />
                    <span>{editingRoomId ? 'Simpan Perubahan' : 'Simpan Ruangan'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Kode Ruangan</th>
                      <th>Nama Ruangan</th>
                      <th>Kapasitas</th>
                      <th>Status Aktual</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.length > 0 ? (
                      filteredRooms.map((room) => (
                        <tr key={room.id}>
                          <td className="font-semibold">{room.room_code}</td>
                          <td><strong>{room.room_name}</strong></td>
                          <td>{room.capacity} Peserta</td>
                          <td>
                            <span className={`badge badge-${room.status === 'Tersedia' ? 'active' : 'draft'}`}>{room.status}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="action-btn" onClick={() => {
                                setEditingRoomId(room.id);
                                setNewRoom({ room_code: room.room_code, room_name: room.room_name, capacity: room.capacity, status: room.status });
                                setShowRoomForm(true);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }} title="Edit Ruangan" style={{ color: '#3b82f6' }}>
                                <Edit size={16} />
                              </button>
                              <button className="btn-danger-icon" onClick={() => deleteRoom(room.id)} title="Hapus Ruangan">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Belum ada data ruangan tercatat.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Classes Data View */}
        {activeTab === 'classes-data' && ['admin', 'TU', 'guru'].includes(user?.role) && (
          <div className="school-data-view fade-in">
            <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1>Data Kelas</h1>
                <p>Kelola daftar kelas yang digunakan pada sistem ujian.</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-secondary-admin" onClick={downloadClassTemplate} style={{ borderColor: '#10b981', color: '#10b981', padding: '10px 14px' }}>
                  <Download size={16} /><span className="hide-on-mobile">Template</span>
                </button>
                <label className="btn-secondary-admin" style={{ cursor: 'pointer', margin: 0, padding: '10px 14px', borderColor: '#3b82f6', color: '#3b82f6' }}>
                  <UploadCloud size={16} /><span className="hide-on-mobile">Impor</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handleClassImport} style={{ display: 'none' }} />
                </label>
                <button className="btn-secondary-admin" onClick={exportClassesToExcel} style={{ borderColor: '#f59e0b', color: '#f59e0b', padding: '10px 14px' }}>
                  <FileSpreadsheet size={16} /><span className="hide-on-mobile">Ekspor</span>
                </button>
                <button className="btn-primary-admin" onClick={() => { setNewClass({ class_name: '', grade: '', description: '' }); setEditingClassId(null); setShowClassForm(!showClassForm); }}>
                  <Plus size={18} /><span>{showClassForm ? 'Batal' : 'Tambah Kelas'}</span>
                </button>
              </div>
            </div>

            {showClassForm && (
              <div className="admin-recent-section glass-panel fade-in" style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0' }}>{editingClassId ? 'Edit Kelas' : 'Kelas Baru'}</h3>
                <div className="form-grid">
                  <div className="form-group-admin">
                    <label>Nama Kelas</label>
                    <input type="text" placeholder="Contoh: 10 IPA 1" value={newClass.class_name} onChange={e => setNewClass({ ...newClass, class_name: e.target.value })} />
                  </div>
                  <div className="form-group-admin">
                    <label>Tingkat / Grade</label>
                    <input type="text" placeholder="Contoh: 10, 11, 12" value={newClass.grade} onChange={e => setNewClass({ ...newClass, grade: e.target.value })} />
                  </div>
                  <div className="form-group-admin" style={{ gridColumn: '1 / -1' }}>
                    <label>Keterangan (Opsional)</label>
                    <input type="text" placeholder="Contoh: Kelas unggulan jurusan IPA" value={newClass.description} onChange={e => setNewClass({ ...newClass, description: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  {editingClassId && (
                    <button className="btn-secondary-admin" onClick={() => { setEditingClassId(null); setNewClass({ class_name: '', grade: '', description: '' }); setShowClassForm(false); }}>Batal Edit</button>
                  )}
                  <button className="btn-primary-admin" onClick={handleSaveClass}>
                    <Save size={16} /><span>{editingClassId ? 'Simpan Perubahan' : 'Simpan Kelas'}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="admin-recent-section glass-panel">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nama Kelas</th>
                      <th>Tingkat</th>
                      <th>Keterangan</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Belum ada data kelas. Tambah atau impor sekarang.</td></tr>
                    )}
                    {classes.map(c => (
                      <tr key={c.id}>
                        <td className="font-semibold">{c.class_name}</td>
                        <td>{c.grade || '-'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{c.description || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="action-btn" title="Edit" style={{ color: '#3b82f6' }} onClick={() => {
                              setNewClass({ class_name: c.class_name, grade: c.grade || '', description: c.description || '' });
                              setEditingClassId(c.id);
                              setShowClassForm(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}><Edit size={15} /></button>
                            <button className="action-btn" title="Hapus" onClick={() => deleteClass(c.id)}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Fallback dummy view */}
        {activeTab !== 'dashboard' && activeTab !== 'add-exam' && activeTab !== 'exams' && activeTab !== 'analytics' && activeTab !== 'question-bank' && activeTab !== 'students' && activeTab !== 'settings' && activeTab !== 'staff' && activeTab !== 'school-data' && activeTab !== 'rooms-data' && activeTab !== 'live-record' && activeTab !== 'groups-data' && activeTab !== 'classes-data' && (
          <div className="dummy-view fade-in glass-panel">
            <Activity size={48} className="dummy-icon" />
            <h2>Modul Sedang Dikembangkan</h2>
            <p>Fitur untuk modul {activeTab} akan segera hadir.</p>
          </div>
        )}
      </main>

      {/* Pick Question from Bank Modal */}
      {showBankModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.7)', zIndex: 9999, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-light)', margin: 0 }}>Ambil dari Bank Soal</h2>
              <button className="btn-secondary-admin" onClick={() => { setShowBankModal(false); setSelectedBankQuestions([]); setBankModalSubjectFilter('all'); setBankModalClassFilter('all'); }} style={{ padding: '8px 16px' }}>Batal</button>
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <select
                value={bankModalSubjectFilter}
                onChange={e => setBankModalSubjectFilter(e.target.value)}
                style={{ flex: 1, minWidth: '150px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-light)', fontFamily: 'inherit' }}
              >
                <option value="all" style={{ color: 'black' }}>Semua Mata Pelajaran</option>
                {[...new Set(questions.map(q => q.subject))].sort().map(sub => (
                  <option key={sub} value={sub} style={{ color: 'black' }}>{sub}</option>
                ))}
              </select>
              <select
                value={bankModalClassFilter}
                onChange={e => setBankModalClassFilter(e.target.value)}
                style={{ flex: 1, minWidth: '150px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'var(--text-light)', fontFamily: 'inherit' }}
              >
                <option value="all" style={{ color: 'black' }}>Semua Kelas</option>
                {classes.map(c => (
                  <option key={c.id} value={c.class_name} style={{ color: 'black' }}>{c.class_name}</option>
                ))}
              </select>
            </div>

            {/* Select All / Deselect All bar */}
            {(() => {
              const bankFiltered = questions.filter(q =>
                (bankModalSubjectFilter === 'all' || q.subject === bankModalSubjectFilter) &&
                (bankModalClassFilter === 'all' || (q.class_name && q.class_name === bankModalClassFilter))
              );
              const allSelected = bankFiltered.length > 0 && bankFiltered.every(q => selectedBankQuestions.some(s => s.id === q.id));
              return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{bankFiltered.length} soal ditemukan</span>
                  <button
                    onClick={() => {
                      if (allSelected) {
                        setSelectedBankQuestions(prev => prev.filter(s => !bankFiltered.some(q => q.id === s.id)));
                      } else {
                        const toAdd = bankFiltered.filter(q => !selectedBankQuestions.some(s => s.id === q.id));
                        setSelectedBankQuestions(prev => [...prev, ...toAdd]);
                      }
                    }}
                    style={{ padding: '5px 14px', background: allSelected ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${allSelected ? '#8b5cf6' : 'rgba(255,255,255,0.2)'}`, color: allSelected ? '#8b5cf6' : 'var(--text-light)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckSquare size={14} />
                    {allSelected ? 'Batal Pilih Semua' : 'Pilih Semua'}
                  </button>
                </div>
              );
            })()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, marginBottom: '20px', paddingRight: '10px' }}>
              {questions.filter(q =>
                (bankModalSubjectFilter === 'all' || q.subject === bankModalSubjectFilter) &&
                (bankModalClassFilter === 'all' || (q.class_name && q.class_name === bankModalClassFilter))
              ).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', color: 'var(--text-muted)' }}>Tidak ada soal yang sesuai filter.</div>
              ) : (
                questions.filter(q =>
                  (bankModalSubjectFilter === 'all' || q.subject === bankModalSubjectFilter) &&
                  (bankModalClassFilter === 'all' || (q.class_name && q.class_name === bankModalClassFilter))
                ).map(q => {
                  const isSelected = selectedBankQuestions.some(sel => sel.id === q.id);
                  return (
                    <div key={q.id} onClick={() => toggleBankQuestionSelection(q)} style={{ background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0,0,0,0.2)', border: `1px solid ${isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', gap: '16px', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '4px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${isSelected ? '#8b5cf6' : 'rgba(255,255,255,0.3)'}`, background: isSelected ? '#8b5cf6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <CheckSquare size={14} color="white" />}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', borderRadius: '6px' }}>{q.subject}</span>
                          {q.class_name && <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(16,185,129,0.2)', color: '#34d399', borderRadius: '6px' }}>{q.class_name}</span>}
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-light)' }}>{q.text}</p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Opsi: {q.options.join(' | ')}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)' }}>Terpilih: <strong>{selectedBankQuestions.length}</strong> Soal</span>
              <button
                className="btn-primary-admin"
                onClick={applyBankQuestions}
                disabled={selectedBankQuestions.length === 0}
                style={{ opacity: selectedBankQuestions.length === 0 ? 0.5 : 1, cursor: selectedBankQuestions.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Pindahkan ke Ujian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding wizard â€” shown on first login */}
      {showOnboarding && (
        <Onboarding
          onNavigate={handleOnboardingNavigate}
          onComplete={handleOnboardingComplete}
          stepDoneKey={onboardingStepDoneKey}
        />
      )}
    </motion.div>
  );
};

export default AdminDashboard;
