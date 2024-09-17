import React, { useEffect, useState } from 'react';
import { axiosASInstance, axiosDASInstance } from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
  CircularProgress,
  Button,
  Typography,
  Grid,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Remove, Logout, DarkMode, LightMode } from '@mui/icons-material';

const CadeiraTable = ({
  classesData,
  schedule,
  searchTerm,
  onSearchChange,
  onToggleClass,
  onOpenDialog,
  loading,
  theme,
}) => {
  return (
    <Paper sx={{ padding: 2, display: 'flex', flexDirection: 'column', height: { xs: '300px', sm: '400px', md: '450px' }, backgroundColor: theme === 'light' ? '#ffffff' : '#424242', color: theme === 'light' ? '#000000' : '#ffffff' }}>
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label="Pesquisar Cadeira"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={onSearchChange}
          sx={{
            input: { color: theme === 'light' ? '#000000' : '#ffffff' },
            label: { color: theme === 'light' ? '#000000' : '#ffffff' },
            fieldset: { borderColor: theme === 'light' ? '#000000' : '#ffffff' },
          }}
        />
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }} />
          <Typography variant="body1" sx={{ marginLeft: 2, color: theme === 'light' ? '#000000' : '#ffffff' }}>Carregando cadeiras...</Typography>
        </Box>
      ) : classesData.length > 0 ? (
        <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Cadeira</TableCell>
                <TableCell sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Turma</TableCell>
                <TableCell sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Horários</TableCell>
                <TableCell align="center" sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classesData.map((classData, index) => {
                const isSelected = Object.values(schedule).some(
                  (item) => item.subjectName === classData.subject.name && item.classID === classData.classID
                );

                const hasSameSubjectConflict = Object.values(schedule).some(
                  (item) => item.subjectName === classData.subject.name && item.classID !== classData.classID
                );

                const hasTimeConflict = classData.schedules?.some((scheduleItem) => {
                  const key = `${scheduleItem.day} ${scheduleItem.start}-${scheduleItem.end}`;
                  return schedule[key] && schedule[key].subjectName !== classData.subject.name;
                });

                const rowBackgroundColor = isSelected
                  ? theme === 'light' ? '#e0f2f1' : '#37474f'
                  : hasSameSubjectConflict || hasTimeConflict
                  ? theme === 'light' ? '#fff8e1' : '#424242'
                  : theme === 'light' ? '#ffffff' : '#303030';

                return (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: rowBackgroundColor,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: isSelected ? theme === 'light' ? '#b2dfdb' : '#455a64' : theme === 'light' ? '#f0f0f0' : '#424242',
                      },
                      position: 'relative',
                      transition: 'background-color 0.3s ease',
                      color: theme === 'light' ? '#000000' : '#ffffff',
                    }}
                    onDoubleClick={() => onToggleClass(classData)}
                  >
                    <TableCell sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>{classData.subject.name}</TableCell>
                    <TableCell sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>T{classData.classID}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {classData.schedules?.map((schedule, i) => (
                          <Chip
                            key={i}
                            label={`${schedule.day} ${schedule.start} - ${schedule.end}`}
                            sx={{ margin: 0.5, backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}
                          />
                        )) || <Typography variant="caption" sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Horário não disponível</Typography>}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={isSelected ? "Remover da Agenda" : "Adicionar à Agenda"}>
                        <IconButton
                          color={isSelected ? "error" : "success"}
                          onClick={() => onToggleClass(classData)}
                          sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}
                        >
                          {isSelected ? <Remove /> : <Add />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Detalhes da Turma">
                        <IconButton color="primary" onClick={() => onOpenDialog(classData)} sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>
                          <i className="fas fa-info-circle"></i>
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" align="center" sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Nenhuma cadeira disponível.</Typography>
      )}
    </Paper>
  );
};

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [courseCode, setCourseCode] = useState('');
  const [curriculumCode, setCurriculumCode] = useState('');
  const [creditsInfo, setCreditsInfo] = useState({
    mandatory: 0,
    optional: 0,
    complementary: 0,
  });
  const [completedTerms, setCompletedTerms] = useState(0);
  const [completedCredits, setCompletedCredits] = useState({
    mandatory: 0,
    optional: 0,
    complementary: 0,
  });
  const [selectedTerm, setSelectedTerm] = useState('');
  const [recommendedSubjects, setRecommendedSubjects] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [approvedSubjectNames, setApprovedSubjectNames] = useState([]);
  const [agendas, setAgendas] = useState([{}]);
  const [currentAgendaIndex, setCurrentAgendaIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [slotDialog, setSlotDialog] = useState({ open: false, slotTime: '', slotDay: '', availableClasses: [] });
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

  const handleLoadClassesAndRecommendations = async (term) => {
    const token = localStorage.getItem('token');

    try {
      const classesResponse = await axiosDASInstance.get('/class/getClassCourse', {
        headers: {
          'Authentication-Token': token,
        },
        params: {
          courseCode,
          term: term,
        },
      });

      let classesData = classesResponse.data;

      const curriculumResponse = await axiosDASInstance.get('/course/getSubjectsPerCurriculum', {
        headers: {
          'Authentication-Token': token,
        },
        params: {
          courseCode,
          curriculumCode,
        },
      });

      const curriculumSubjects = curriculumResponse.data;

      classesData = classesData.filter(classData =>
        curriculumSubjects.some(subject => subject.subject.subjectCode === classData.subject.subjectCode)
      );

      const classesWithSchedules = await Promise.all(classesData.map(async classData => {
        const scheduleResponse = await axiosDASInstance.get('/class/getClassSchedule', {
          headers: {
            'Authentication-Token': token,
          },
          params: {
            subjectCode: classData.subject.subjectCode,
            term: term,
          },
        });

        const schedules = scheduleResponse.data
          .filter(schedule => schedule.academicClassId === classData.classID)
          .map(schedule => {
            const dayMap = {
              2: 'Segunda',
              3: 'Terça',
              4: 'Quarta',
              5: 'Quinta',
              6: 'Sexta',
            };

            return {
              day: dayMap[schedule.dayOfWeek],
              start: schedule.startHour,
              end: schedule.endHour,
            };
          });
        return { ...classData, schedules };
      }));

      const filteredClasses = classesWithSchedules.filter(classData => !approvedSubjectNames.includes(classData.subject.name));

      setAvailableClasses(filteredClasses);
      setLoading(false);

      const recommended = filteredClasses.filter(classData => {
        const matchingCurriculumSubject = curriculumSubjects.find(
          subject => subject.subject.name === classData.subject.name &&
            subject.type !== 'OPCIONAL' &&
            subject.idealSemester <= completedTerms + 1
        );
        return matchingCurriculumSubject !== undefined;
      });

      setRecommendedSubjects(recommended);
    } catch (error) {
      console.error('Erro ao buscar cadeiras e recomendações:', error);
      if (error.response && error.response.data.message === "Expired token.") {
        localStorage.clear();
        navigate('/login');
      } else {
      }
    }
  };

  const fetchCurrentTerm = async (campus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axiosDASInstance.get('termCalendar/getAllByCurrentTerm', {
        headers: {
          'Authentication-Token': token,
        },
      });

      const termData = response.data.find(term => term.campus === campus);
      if (termData) {
        const term = `${termData.term.toString().slice(0, 4)}.${termData.term.toString().slice(4, 5)}`;
        setSelectedTerm(term);
        await handleLoadClassesAndRecommendations(term);
      }
    } catch (error) {
      console.error('Erro ao buscar o período atual:', error);
      if (error.response && error.response.data.message === "Expired token.") {
        localStorage.clear();
        navigate('/login');
      } else {
        showSnackbar('Houve um problema ao carregar o período atual. Tente novamente mais tarde.', 'error');
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const profileResponse = await axiosASInstance.get('/profile', {
          headers: {
            'Authentication-Token': token,
          },
        });

        const profileData = profileResponse.data;
        setProfile(profileData);

        const historyResponse = await axiosDASInstance.get('/student/getHistory', {
          headers: {
            'Authentication-Token': token,
          },
          params: {
            registration: profileData.id,
          },
        });
        const historyData = historyResponse.data.data;
        const approvedSubjects = historyResponse.data.enrollments
          .filter(enrollment => enrollment.status === 'APROVADO')
          .map(enrollment => ({
            subjectCode: enrollment.subject.subjectCode,
            name: enrollment.subject.name,
          }));

        const approvedSubjectNamesList = approvedSubjects.map(subject => subject.name);

        setApprovedSubjectNames(approvedSubjectNamesList);

        setCourseCode(historyData.courseCode);
        setCurriculumCode(historyData.curriculumCode);
        setCompletedTerms(historyResponse.data.metrics.completedTerms);

        const curriculumResponse = await axiosDASInstance.get('/course/getCurriculum', {
          headers: {
            'Authentication-Token': token,
          },
          params: {
            courseCode: historyData.courseCode,
            curriculumCode: historyData.curriculumCode,
          },
        });

        const curriculumData = curriculumResponse.data;
        const minCreditsInfo = {
          mandatory: curriculumData.minMandatoryCreditsNeeded,
          optional: curriculumData.minOptionalCreditsNeeded,
          complementary: curriculumData.minComplementaryCreditsNeeded,
        };

        setCreditsInfo(minCreditsInfo);

        const subjectsResponse = await axiosDASInstance.get('/course/getSubjectsPerCurriculum', {
          headers: {
            'Authentication-Token': token,
          },
          params: {
            courseCode: historyData.courseCode,
            curriculumCode: historyData.curriculumCode,
          },
        });

        const subjectsData = subjectsResponse.data;
        let mandatoryCredits = 0;
        let optionalCredits = 0;
        let complementaryCredits = 0;

        subjectsData.forEach(subject => {
          const isApproved = approvedSubjectNamesList.includes(subject.subject.name);
          if (isApproved) {
            if (subject.type === 'OBRIGATORIO') {
              mandatoryCredits += subject.subject.credits;
            } else if (subject.type === 'OPCIONAL') {
              optionalCredits += subject.subject.credits;
            } else if (subject.type === 'COMPLEMENTAR') {
              complementaryCredits += subject.subject.credits;
            }
          }
        });

        setCompletedCredits({
          mandatory: mandatoryCredits,
          optional: optionalCredits,
          complementary: complementaryCredits,
        });

        const campus = parseInt(profileData.id.toString()[0], 10);
        await fetchCurrentTerm(campus);

        if (historyData.courseCode && historyData.curriculumCode && selectedTerm) {
          await handleLoadClassesAndRecommendations(selectedTerm);
        } else {
          console.error("Course code, curriculum code ou termo selecionado estão indefinidos");
        }

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        if (error.response && error.response.data.message === "Expired token.") {
          localStorage.clear();
          navigate('/login');
        } else {
          showSnackbar('Houve um problema ao carregar as informações. Tente novamente mais tarde.', 'error');
        }
      }

    };
    fetchData();
  }, [navigate, selectedTerm]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddClassToSchedule = (classData) => {
    if (!classData.schedules) {
      showSnackbar(`Horários não encontrados para a cadeira ${classData.subject.name}`, 'warning');
      return;
    }

    for (const scheduleItem of classData.schedules) {
      const key = `${scheduleItem.day} ${scheduleItem.start}-${scheduleItem.end}`;
      if (agendas[currentAgendaIndex][key]) {
        showSnackbar(`Conflito de horário com ${agendas[currentAgendaIndex][key].subjectName} na ${key}`, 'warning');
        return;
      }
    }

    const newSchedule = { ...agendas[currentAgendaIndex] };
    for (const scheduleItem of classData.schedules) {
      const key = `${scheduleItem.day} ${scheduleItem.start}-${scheduleItem.end}`;
      newSchedule[key] = {
        subjectName: classData.subject.name,
        classID: classData.classID,
      };
    }
    const updatedAgendas = [...agendas];
    updatedAgendas[currentAgendaIndex] = newSchedule;
    setAgendas(updatedAgendas);
  };

  const handleRemoveClassFromSchedule = (subjectName) => {
    const newSchedule = { ...agendas[currentAgendaIndex] };
    for (const key in newSchedule) {
      if (newSchedule[key].subjectName === subjectName) {
        delete newSchedule[key];
      }
    }
    const updatedAgendas = [...agendas];
    updatedAgendas[currentAgendaIndex] = newSchedule;
    setAgendas(updatedAgendas);
  };

  const handleToggleClassInSchedule = (classData) => {
    const isSelected = Object.values(agendas[currentAgendaIndex]).some(
      (item) => item.subjectName === classData.subject.name && item.classID === classData.classID
    );

    const hasSameSubjectConflict = Object.values(agendas[currentAgendaIndex]).some(
      (item) => item.subjectName === classData.subject.name && item.classID !== classData.classID
    );

    if (isSelected) {
      handleRemoveClassFromSchedule(classData.subject.name);
    } else if (hasSameSubjectConflict) {
      showSnackbar(`Conflito: Já existe uma turma da disciplina ${classData.subject.name} na sua agenda.`, 'warning');
    } else {
      handleAddClassToSchedule(classData);
    }
  };

  const handleOpenDialog = (classData) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleSearchChangeOffered = (event) => {
    setSearchTermOffered(event.target.value.toLowerCase());
  };

  const handleSearchChangeRecommended = (event) => {
    setSearchTermRecommended(event.target.value.toLowerCase());
  };

  const filteredAvailableClasses = availableClasses.filter((classData) =>
    classData.subject.name.toLowerCase().includes(searchTermOffered)
  );

  const filteredRecommendedClasses = recommendedSubjects.filter((classData) =>
    classData.subject.name.toLowerCase().includes(searchTermRecommended)
  );

  const handleOpenSlotDialog = (day, timeSlot) => {
    const availableClassesForSlot = availableClasses.filter(classData => {
      const hasSameSubjectConflict = Object.values(agendas[currentAgendaIndex]).some(
        (item) => item.subjectName === classData.subject.name && item.classID !== classData.classID
      );

      const matchesTimeSlot = classData.schedules?.some(schedule =>
        schedule.day === day && schedule.start === timeSlot.split('-')[0]
      );

      return !hasSameSubjectConflict && matchesTimeSlot;
    });

    setSlotDialog({
      open: true,
      slotTime: timeSlot,
      slotDay: day,
      availableClasses: availableClassesForSlot,
    });
  };

  const handleCloseSlotDialog = () => {
    setSlotDialog({ open: false, slotTime: '', slotDay: '', availableClasses: [] });
  };

  const handleAddClassToScheduleFromDialog = (classData) => {
    const hasSameSubjectConflict = Object.values(agendas[currentAgendaIndex]).some(
      (item) => item.subjectName === classData.subject.name && item.classID !== classData.classID
    );

    if (hasSameSubjectConflict) {
      showSnackbar(`Conflito: Já existe uma turma da disciplina ${classData.subject.name} na sua agenda.`, 'warning');
    } else {
      handleAddClassToSchedule(classData);
      handleCloseSlotDialog();
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  const handleAddAgenda = () => {
    setAgendas([...agendas, {}]);
    setCurrentAgendaIndex(agendas.length);
  };

  const handleSwitchAgenda = (index) => {
    setCurrentAgendaIndex(index);
  };

  const handleClearAgenda = () => {
    const updatedAgendas = [...agendas];
    updatedAgendas[currentAgendaIndex] = {};
    setAgendas(updatedAgendas);
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
            Bem-vindo, {profile ? profile.name.split(' ')[0].charAt(0).toUpperCase() + profile.name.split(' ')[0].slice(1).toLowerCase() : 'Carregando...'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} textAlign="right">
          <Tooltip title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}>
            <IconButton onClick={toggleTheme} color="primary">
              {theme === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton color="primary" onClick={handleLogout}>
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

      <Paper sx={{ padding: 2, marginTop: 2, backgroundColor: theme === 'light' ? '#ffffff' : '#424242', color: theme === 'light' ? '#000000' : '#ffffff' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Matrícula: {profile ? profile.id : 'Carregando...'}</Typography>
            <Typography variant="subtitle1">Curso: {courseCode}</Typography>
            <Typography variant="subtitle1">Grade: {curriculumCode}</Typography>
            <Typography variant="subtitle1">Períodos Completos: {completedTerms}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">
              Créditos Obrigatórios: {completedCredits.mandatory}/{creditsInfo.mandatory}
            </Typography>
            <Typography variant="subtitle1">
              Créditos Opcionais: {completedCredits.optional}/{creditsInfo.optional}
            </Typography>
            <Typography variant="subtitle1">
              Créditos Complementares: {completedCredits.complementary}/{creditsInfo.complementary}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={4} sx={{ marginTop: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Cadeiras Ofertadas em {selectedTerm}
          </Typography>
          <CadeiraTable
            classesData={filteredAvailableClasses}
            schedule={agendas[currentAgendaIndex]}
            searchTerm={searchTermOffered}
            onSearchChange={handleSearchChangeOffered}
            onToggleClass={handleToggleClassInSchedule}
            onOpenDialog={handleOpenDialog}
            loading={loading}
            theme={theme}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Cadeiras Recomendadas
          </Typography>
          <CadeiraTable
            classesData={filteredRecommendedClasses}
            schedule={agendas[currentAgendaIndex]}
            searchTerm={searchTermRecommended}
            onSearchChange={handleSearchChangeRecommended}
            onToggleClass={handleToggleClassInSchedule}
            onOpenDialog={handleOpenDialog}
            loading={loading}
            theme={theme}
          />
        </Grid>
      </Grid>

      <Box sx={{ marginTop: 4 }}>
        <Paper sx={{ padding: 2, backgroundColor: theme === 'light' ? '#ffffff' : '#424242', color: theme === 'light' ? '#000000' : '#ffffff' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Sua Agenda
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '120px', backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Horário</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center', backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Segunda</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center', backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Terça</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center', backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Quarta</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center', backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Quinta</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center', backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Sexta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {['8:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'].map(timeSlot => (
                  <TableRow key={timeSlot}>
                    <TableCell sx={{ width: '120px', color: theme === 'light' ? '#000000' : '#ffffff' }}>{timeSlot}</TableCell>
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(day => {
                      const key = `${day} ${timeSlot}`;
                      const classInfo = agendas[currentAgendaIndex][key];
                      return (
                        <Tooltip title={classInfo ? "Clique para remover a cadeira da agenda" : "Clique para adicionar uma cadeira"}>
                          <TableCell
                            key={day}
                            sx={{
                              width: '200px',
                              maxWidth: '200px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              backgroundColor: classInfo ? (theme === 'light' ? '#e0f7fa' : '#37474f') : (theme === 'light' ? '#fff' : '#303030'),
                              cursor: classInfo ? 'pointer' : 'default',
                              textAlign: 'center',
                              padding: '8px',
                              position: 'relative',
                              color: theme === 'light' ? '#000000' : '#ffffff',
                              '&:hover': {
                                backgroundColor: classInfo ? (theme === 'light' ? '#ffcdd2' : '#455a64') : (theme === 'light' ? '#f0f0f0' : '#424242'),
                                '& .remove-text': {
                                  opacity: 1,
                                }
                              }
                            }}
                            onClick={() => {
                              if (classInfo) {
                                handleRemoveClassFromSchedule(classInfo.subjectName);
                              } else {
                                handleOpenSlotDialog(day, timeSlot);
                              }
                            }}
                          >
                            {classInfo ? (
                              <>
                                <Typography variant="subtitle2" noWrap sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>{classInfo.subjectName}</Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    position: 'absolute',
                                    bottom: 2,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    opacity: 0,
                                    transition: 'opacity 0.3s ease-in-out',
                                    color: 'red',
                                  }}
                                  className="remove-text"
                                >
                                  Remover
                                </Typography>
                              </>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#aaa' }}>
                                <Add fontSize="small" />
                                <Typography variant="caption">Adicionar Cadeira</Typography>
                              </Box>
                            )}
                          </TableCell>
                        </Tooltip>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Box sx={{ marginTop: 2, textAlign: 'center' }}>
        <Button variant="contained" color="error" onClick={handleClearAgenda}>
          Limpar Agenda Atual
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, marginBottom: 2, marginTop: 4 }}>
        {agendas.map((_, index) => (
          <Button
            key={index}
            variant={index === currentAgendaIndex ? 'contained' : 'outlined'}
            onClick={() => handleSwitchAgenda(index)}
            sx={{
              backgroundColor: index === currentAgendaIndex ? (theme === 'light' ? '#e0e0e0' : '#616161') : 'inherit',
              color: theme === 'light' ? '#000000' : '#ffffff'
            }}
          >
            {index + 1}
          </Button>
        ))}
        <IconButton color="primary" onClick={handleAddAgenda}>
          <Add />
        </IconButton>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#424242', color: theme === 'light' ? '#000000' : '#ffffff' }}>Detalhes da Turma</DialogTitle>
        <DialogContent sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#424242', color: theme === 'light' ? '#000000' : '#ffffff' }}>
          {selectedClass && (
            <>
              <Typography variant="subtitle1">Cadeira: {selectedClass.subject.name}</Typography>
              <Typography variant="subtitle1">Turma: T{selectedClass.classID}</Typography>
              <Typography variant="subtitle1">Horários:</Typography>
              {selectedClass.schedules.map((schedule, i) => (
                <Chip key={i} label={`${schedule.day} ${schedule.start} - ${schedule.end}`} sx={{ margin: 0.5, backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }} />
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#424242' }}>
          <Button onClick={handleCloseDialog} color="primary" sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={slotDialog.open} onClose={handleCloseSlotDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#424242', color: theme === 'light' ? '#000000' : '#ffffff' }}>Cadeiras Disponíveis para {slotDialog.slotDay}, {slotDialog.slotTime}</DialogTitle>
        <DialogContent sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#424242', color: theme === 'light' ? '#000000' : '#ffffff' }}>
          <List>
            {slotDialog.availableClasses.length > 0 ? (
              slotDialog.availableClasses.map((classData, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleAddClassToScheduleFromDialog(classData)}>
                    <ListItemText primary={`${classData.subject.name} - T${classData.classID}`} sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Nenhuma cadeira disponível neste horário.</Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: theme === 'light' ? '#ffffff' : '#424242' }}>
          <Button onClick={handleCloseSlotDialog} color="primary" sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashboardPage;
