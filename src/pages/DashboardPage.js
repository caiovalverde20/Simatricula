import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Snackbar, Alert, IconButton, Tooltip } from '@mui/material';
import { DarkMode, LightMode, Logout } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StudentInfo from '../components/StudentInfo';
import DisciplinaTable from '../components/DisciplinaTable';
import { axiosDASInstance, axiosDASInstanceV1} from '../utils/axiosConfig';
import ScheduleTable from '../components/ScheduleTable';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [curriculumInfo, setCurriculumInfo] = useState(null);
  const [completedCredits, setCompletedCredits] = useState({
    mandatory: 0,
    optional: 0,
    complementary: 0,
  });
  const [availableClasses, setAvailableClasses] = useState([]);
  const [recommendedSubjects, setRecommendedSubjects] = useState([]);
  const [agendas, setAgendas] = useState([{}]);
  const [currentAgendaIndex, setCurrentAgendaIndex] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [searchTermOffered, setSearchTermOffered] = useState('');
  const [searchTermRecommended, setSearchTermRecommended] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message, severity = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const getBackgroundColor = () => (theme === 'light' ? '#d6eaf8' : '#121212');
  const getTextColor = () => (theme === 'light' ? '#000000' : '#ffffff');

  const fetchCurrentTerm = async (campus) => {
    const token = localStorage.getItem('token');
    if (!token || !campus) {
      showSnackbar('Erro ao carregar o campus ou token não encontrado', 'error');
      return;
    }

    try {
      const response = await axiosDASInstanceV1.get('/calendarios/periodo-corrente', {
        params: { campus },
        headers: { 'token-de-autenticacao': token },
      });

      if (response.data && response.data.length > 0) {
        const currentPeriodData = response.data
        .filter((period) => period.campus === campus)
        .sort((a, b) => {
          const [ay, as] = a.periodo.split('.').map(Number);
          const [by, bs] = b.periodo.split('.').map(Number);
          return by - ay || bs - as; 
        })[0]; 

        if (currentPeriodData && currentPeriodData.periodo) {
          setSelectedTerm(currentPeriodData.periodo);
        } else {
          showSnackbar('Período atual não encontrado para o campus', 'warning');
        }
      } else {
        showSnackbar('Nenhuma informação de período retornada pela API', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar o período atual:', error);
      showSnackbar('Erro ao carregar o período atual. Tente novamente mais tarde.', 'error');
    }
  };

  const fetchStudentData = async () => {
    const token = localStorage.getItem('token');
    const studentId = localStorage.getItem('studentId');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axiosDASInstance.get('/estudantes/historico/estudante', {
        params: { estudante: studentId },
        headers: { 'token-de-autenticacao': token },
      });

      const student = response.data;
      setStudentData(student);

      const campus = Number(studentId[0]);
      await fetchCurrentTerm(campus);

      fetchCurriculumInfo(student.codigo_do_curso, student.codigo_do_curriculo);
      fetchCurriculumSubjects(student.codigo_do_curso, student.codigo_do_curriculo, student.historico_de_matriculas, student.periodos_completados);
    } catch (error) {
      console.error('Erro ao buscar dados do estudante:', error);
      showSnackbar('Erro ao carregar os dados do estudante. Tente novamente mais tarde.', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentData && selectedTerm) {
      fetchAvailableClasses(studentData.codigo_do_curso, studentData.codigo_do_curriculo, studentData.historico_de_matriculas);
      fetchCurriculumSubjects(studentData.codigo_do_curso, studentData.codigo_do_curriculo, studentData.historico_de_matriculas, studentData.periodos_completados);
    }
  }, [studentData, selectedTerm]);

  const fetchCurriculumInfo = async (curso, curriculo) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axiosDASInstance.get('/curriculos/curriculo', {
        params: { curso, curriculo },
        headers: { 'token-de-autenticacao': token },
      });
      setCurriculumInfo(response.data);
    } catch (error) {
      console.error('Erro ao buscar os dados do currículo:', error);
      showSnackbar('Erro ao carregar as informações do currículo. Tente novamente mais tarde.', 'error');
    }
  };

  const handleRemoveClassFromSchedule = (subjectName) => {
    const updatedAgenda = { ...agendas[currentAgendaIndex] };
    Object.keys(updatedAgenda).forEach((slot) => {
      if (updatedAgenda[slot] && updatedAgenda[slot].subjectName === subjectName) {
        delete updatedAgenda[slot];
      }
    });
    const updatedAgendas = [...agendas];
    updatedAgendas[currentAgendaIndex] = updatedAgenda;
    setAgendas(updatedAgendas);
  };

  const handleOpenSlotDialog = (day, timeSlot) => {
    console.log(`Abrir diálogo para ${day} às ${timeSlot}`);
  };

  const handleClearAgenda = () => {
    const updatedAgendas = [...agendas];
    updatedAgendas[currentAgendaIndex] = {};
    setAgendas(updatedAgendas);
  };

  const handleSwitchAgenda = (index) => {
    setCurrentAgendaIndex(index);
  };

  const handleAddAgenda = () => {
    const updatedAgendas = [...agendas, {}];
    setAgendas(updatedAgendas);
    setCurrentAgendaIndex(updatedAgendas.length - 1);
  };

  const fetchCurriculumSubjects = async (curso, curriculo, studentHistory, completedPeriods) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axiosDASInstance.get('/disciplinas-por-curriculo', {
        params: { curso, curriculo },
        headers: { 'token-de-autenticacao': token },
      });

      const curriculumSubjects = response.data;

      const mandatoryCredits = calculateCredits(studentHistory, curriculumSubjects, 'OBRIGATORIO');
      const optionalCredits = calculateCredits(studentHistory, curriculumSubjects, 'OPCIONAL');
      const complementaryCredits = calculateCredits(studentHistory, curriculumSubjects, 'COMPLEMENTAR');

      setCompletedCredits({
        mandatory: mandatoryCredits,
        optional: optionalCredits,
        complementary: complementaryCredits,
      });

      const studentId = localStorage.getItem('studentId');

      const approvedSubjects = studentHistory
        .filter(enrollment => enrollment.status === 'Aprovado')
        .map(enrollment => enrollment.codigo_da_disciplina);

      const recommended = curriculumSubjects
        .filter((subject) => {
          if (approvedSubjects.includes(subject.codigo_da_disciplina)) {
            return false;
          }
          if (subject.tipo === 'OPCIONAL') {
            return false;
          }
          const maxSemester = completedPeriods + 1;
          if (subject.semestre_ideal && subject.semestre_ideal > maxSemester) {
            return false;
          }
          return true;
        })
        .map((subject) => {
          return {
            turma: "recomendado",
            codigo_da_disciplina: subject.codigo_da_disciplina,
            nome_da_disciplina: subject.nome,
            campus: Number(studentId[0]),
            quantidade_de_creditos: subject.quantidade_de_creditos,
            carga_horaria: subject.horas_totais,
            periodo: selectedTerm,
            schedules: [],
          };
        });

      setRecommendedSubjects(recommended);
    } catch (error) {
      console.error('Erro ao buscar disciplinas do currículo:', error);
      showSnackbar('Erro ao carregar as disciplinas do currículo. Tente novamente mais tarde.', 'error');
    }
  };

  const calculateCredits = (studentHistory, curriculumSubjects, type) => {
    let totalCredits = 0;
    const approvedHistory = studentHistory.filter((enrollment) => enrollment.status === 'Aprovado');

    approvedHistory.forEach((enrollment) => {
      const matchingSubject = curriculumSubjects.find(
        (subject) =>
          subject.codigo_da_disciplina === enrollment.codigo_da_disciplina &&
          subject.tipo === type
      );
      if (matchingSubject) {
        totalCredits += matchingSubject.quantidade_de_creditos;
      }
    });

    return totalCredits;
  };

  const fetchAvailableClasses = async (curso, curriculo, studentHistory) => {
    const token = localStorage.getItem('token');
    if (!token || !selectedTerm) return;

    try {
      const curriculumResponse = await axiosDASInstance.get('/disciplinas-por-curriculo', {
        params: { curso, curriculo },
        headers: { 'token-de-autenticacao': token },
      });

      const curriculumSubjects = curriculumResponse.data;
      const studentId = localStorage.getItem('studentId');

      const cursoFormatado = curso === 14102100 ? 108095 : curso;

      const horariosResponse = await axiosDASInstanceV1.get('/horarios', {
        params: {
          'periodo-de': selectedTerm,
          'periodo-ate': selectedTerm,
          campus: Number(studentId[0]),
          curso: cursoFormatado,
        },
        headers: { 'token-de-autenticacao': token },
      });

      const scheduleData = horariosResponse.data;
      const approvedHistory = studentHistory.filter((enrollment) => enrollment.status === 'Aprovado');
      const filteredClasses = filterAlreadyTakenClasses(scheduleData, approvedHistory);

      const validClasses = filteredClasses.filter((classData) =>
        curriculumSubjects.some((subject) => subject.codigo_da_disciplina === classData.codigo_da_disciplina)
      );

      const groupedClasses = groupClassesByTurma(validClasses);
      setAvailableClasses(groupedClasses);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar horários das disciplinas:', error);
      showSnackbar('Erro ao carregar os horários das disciplinas. Tente novamente mais tarde.', 'error');
      setLoading(false);
    }
  };

  const filterAlreadyTakenClasses = (scheduleData, studentHistory) => {
    const takenClasses = studentHistory.map((enrollment) => enrollment.codigo_da_disciplina);
    return scheduleData.filter((classData) => !takenClasses.includes(classData.codigo_da_disciplina));
  };

  const groupClassesByTurma = (scheduleData) => {
    const groupedClasses = {};

    scheduleData.forEach((classData) => {
      const key = `${classData.turma}-${classData.codigo_da_disciplina}`;
      if (!groupedClasses[key]) {
        groupedClasses[key] = {
          turma: classData.turma,
          codigo_da_disciplina: classData.codigo_da_disciplina,
          nome_da_disciplina: classData.nome_da_disciplina,
          codigo_do_setor: classData.codigo_do_setor,
          nome_do_setor: classData.nome_do_setor,
          campus: classData.campus,
          nome_do_campus: classData.nome_do_campus,
          quantidade_de_creditos: classData.quantidade_de_creditos,
          carga_horaria: classData.carga_horaria,
          periodo: classData.periodo,
          schedules: [],
        };
      }

      groupedClasses[key].schedules.push({
        day: classData.dia,
        start: classData.hora_de_inicio,
        end: classData.hora_de_termino,
        room: classData.codigo_da_sala,
      });
    });

    return Object.values(groupedClasses);
  };

  useEffect(() => {
    if (Array.isArray(availableClasses) && availableClasses.length > 0 && recommendedSubjects.length > 0) {
      const updatedRecommended = recommendedSubjects.map((recommendedSubject) => {
        const matchingOffered = availableClasses.find(
          (offeredClass) => offeredClass.codigo_da_disciplina === recommendedSubject.codigo_da_disciplina
        );
        if (matchingOffered) {
          return {
            ...recommendedSubject,
            turma: matchingOffered.turma,
            schedules: matchingOffered.schedules,
          };
        }
        return recommendedSubject;
      });
      setRecommendedSubjects(updatedRecommended);
    }
  }, [availableClasses, recommendedSubjects]);

  useEffect(() => {
    fetchStudentData();
  }, [navigate]);

  const handleSearchChangeOffered = (event) => {
    setSearchTermOffered(event.target.value.toLowerCase());
  };

  const handleSearchChangeRecommended = (event) => {
    setSearchTermRecommended(event.target.value.toLowerCase());
  };

  const handleAddClassToSchedule = (classData) => {
    const updatedAgenda = { ...agendas[currentAgendaIndex] };
  
    classData.schedules.forEach((schedule) => {
      const day = schedule.day;
      const timeSlot = `${schedule.start}-${schedule.end}`;
      const slotKey = `${day} ${timeSlot}`;
  
      if (!updatedAgenda[slotKey]) {
        updatedAgenda[slotKey] = {
          subjectName: classData.nome_da_disciplina,
          classID: classData.turma,
          day: schedule.day,
          start: schedule.start,
          end: schedule.end,
        };
      } else {
        showSnackbar('Já existe uma disciplina nesse horário!', 'warning');
      }
    });
  
    const updatedAgendas = [...agendas];
    updatedAgendas[currentAgendaIndex] = updatedAgenda;
    setAgendas(updatedAgendas);
  };  

  
  const onToggleClass = (classData) => {
    const isAlreadyInSchedule = Object.values(agendas[currentAgendaIndex]).some(
      (item) => item.subjectName === classData.nome_da_disciplina && item.classID === classData.turma
    );

    if (isAlreadyInSchedule) {
      handleRemoveClassFromSchedule(classData.nome_da_disciplina);
    } else {
      handleAddClassToSchedule(classData);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        padding: 4,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={8}>
        <Typography variant="h4" gutterBottom>
          Bem-vindo, {studentData ? studentData.nome.split(' ')[0].charAt(0).toUpperCase() + studentData.nome.split(' ')[0].slice(1).toLowerCase() : 'Carregando...'}
        </Typography>
        </Grid>
        <Grid item xs={12} sm={4} textAlign="right">
          <Tooltip title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}>
            <IconButton onClick={toggleTheme} color="primary">
              {theme === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton
              color="primary"
              onClick={() => {
                localStorage.clear();
                navigate('/login');
              }}
            >
              <Logout />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <StudentInfo
        studentData={studentData}
        completedCredits={completedCredits}
        curriculumInfo={curriculumInfo}
        theme={theme}
      />

      <Grid container spacing={4} sx={{ marginTop: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Disciplinas Ofertadas em {selectedTerm}
          </Typography>
          <DisciplinaTable
            classesData={availableClasses}
            schedule={agendas[currentAgendaIndex]}
            searchTerm={searchTermOffered}
            onSearchChange={handleSearchChangeOffered}
            onToggleClass={onToggleClass}
            loading={loading}
            theme={theme}
            showSnackbar={showSnackbar}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Disciplinas Recomendadas
          </Typography>
          <DisciplinaTable
            classesData={recommendedSubjects}
            schedule={agendas[currentAgendaIndex]}
            searchTerm={searchTermRecommended}
            onSearchChange={handleSearchChangeRecommended}
            onToggleClass={onToggleClass}
            loading={loading}
            theme={theme}
            showSnackbar={showSnackbar}
          />
        </Grid>

        <Grid item xs={12}>
          <ScheduleTable
            agendas={agendas}
            currentAgendaIndex={currentAgendaIndex}
            handleRemoveClassFromSchedule={handleRemoveClassFromSchedule}
            handleOpenSlotDialog={handleOpenSlotDialog}
            handleClearAgenda={handleClearAgenda}
            handleSwitchAgenda={handleSwitchAgenda}
            handleAddAgenda={handleAddAgenda}
            theme={theme}
            availableClasses={availableClasses}
            handleAddClassToSchedule={handleAddClassToSchedule}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
