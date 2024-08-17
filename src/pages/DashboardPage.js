import React, { useEffect, useState } from 'react';
import { axiosASInstance, axiosDASInstance } from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  TextField,
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
} from '@mui/material';
import { Add, Remove, Logout } from '@mui/icons-material';

function DashboardPage() {
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
  const [schedule, setSchedule] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [slotDialog, setSlotDialog] = useState({ open: false, slotTime: '', slotDay: '', availableClasses: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleLoadClassesAndRecommendations = async (term) => {
    const token = localStorage.getItem('token');
  
    try {
      const classesResponse = await axiosDASInstance.get('/das/class/getClassCourse', {
        headers: {
          'Authentication-Token': token,
        },
        params: {
          courseCode,
          term: term,
        },
      });
  
      let classesData = classesResponse.data;
  
      const curriculumResponse = await axiosDASInstance.get('/das/course/getSubjectsPerCurriculum', {
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
        const scheduleResponse = await axiosDASInstance.get('/das/class/getClassSchedule', {
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
      }
    }
  };
  
  const fetchCurrentTerm = async (campus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('https://eureca.sti.ufcg.edu.br/das-dev/v1/termCalendar/getAllByCurrentTerm', {
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
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      try {
        const profileResponse = await axiosASInstance.get('/as/profile', {
          headers: {
            'Authentication-Token': token,
          },
        });
  
        const profileData = profileResponse.data;
        setProfile(profileData);
  
        const historyResponse = await axiosDASInstance.get('/das/student/getHistory', {
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
  
        const curriculumResponse = await axiosDASInstance.get('/das/course/getCurriculum', {
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
  
        const subjectsResponse = await axiosDASInstance.get('/das/course/getSubjectsPerCurriculum', {
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
      console.error(`Horários não encontrados para a cadeira ${classData.subject.name}`);
      return;
    }
  
    for (const scheduleItem of classData.schedules) {
      const key = `${scheduleItem.day} ${scheduleItem.start}-${scheduleItem.end}`;
      if (schedule[key]) {
        alert(`Conflito de horário com ${schedule[key].subjectName} na ${key}`);
        return;
      }
    }
  
    const newSchedule = { ...schedule };
    for (const scheduleItem of classData.schedules) {
      const key = `${scheduleItem.day} ${scheduleItem.start}-${scheduleItem.end}`;
      newSchedule[key] = {
        subjectName: classData.subject.name,
        classID: classData.classID,
      };
    }
    setSchedule(newSchedule);
  };
  
  const handleRemoveClassFromSchedule = (subjectName) => {
    const newSchedule = { ...schedule };
    for (const key in newSchedule) {
      if (newSchedule[key].subjectName === subjectName) {
        delete newSchedule[key];
      }
    }
    setSchedule(newSchedule);
  };

  const handleToggleClassInSchedule = (classData) => {
    const isSelected = Object.values(schedule).some(
      (item) => item.subjectName === classData.subject.name && item.classID === classData.classID
    );
  
    const hasSameSubjectConflict = Object.values(schedule).some(
      (item) => item.subjectName === classData.subject.name && item.classID !== classData.classID
    );
  
    if (isSelected) {
      handleRemoveClassFromSchedule(classData.subject.name);
    } else if (hasSameSubjectConflict) {
      alert(`Conflito: Já existe uma turma da disciplina ${classData.subject.name} na sua agenda.`);
    } else {
      handleAddClassToSchedule(classData);
    }
  };

  const handleOpenDialog = (classData) => {
    setSelectedClass(classData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClass(null);
  };

  const handleOpenSlotDialog = (day, timeSlot) => {
    const availableClassesForSlot = availableClasses.filter(classData => {
      const hasSameSubjectConflict = Object.values(schedule).some(
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
    const hasSameSubjectConflict = Object.values(schedule).some(
      (item) => item.subjectName === classData.subject.name && item.classID !== classData.classID
    );
  
    if (hasSameSubjectConflict) {
      alert(`Conflito: Já existe uma turma da disciplina ${classData.subject.name} na sua agenda.`);
    } else {
      handleAddClassToSchedule(classData);
      handleCloseSlotDialog();
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredAvailableClasses = availableClasses.filter((classData) =>
    classData.subject.name.toLowerCase().includes(searchTerm)
  );

  return (
    <Box sx={{ padding: 4 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={8}>
          <Typography variant="h4" gutterBottom>
            Bem-vindo, {profile ? profile.name.split(' ')[0].charAt(0).toUpperCase() + profile.name.split(' ')[0].slice(1).toLowerCase() : 'Carregando...'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} textAlign="right">
          <Tooltip title="Logout">
            <IconButton color="primary" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
  
      <Paper sx={{ padding: 2, marginTop: 2 }}>
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
        <Paper
          sx={{
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: '300px', sm: '400px', md: '450px' },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Cadeiras Ofertadas em {selectedTerm}
          </Typography>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              label="Pesquisar Cadeira"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Box>
          {filteredAvailableClasses.length > 0 ? (
            <TableContainer
              sx={{
                flex: 1,
                overflowY: 'auto',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Cadeira</TableCell>
                    <TableCell>Turma</TableCell>
                    <TableCell>Horários</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAvailableClasses.map((classData, index) => {
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
                      ? '#e0f2f1'
                      : hasSameSubjectConflict || hasTimeConflict
                      ? '#fff8e1'
                      : '#ffffff';

                    return (
                      <TableRow
                        key={index}
                        sx={{ backgroundColor: rowBackgroundColor }}
                        onDoubleClick={() => handleToggleClassInSchedule(classData)}
                      >
                        <TableCell>{classData.subject.name}</TableCell>
                        <TableCell>T{classData.classID}</TableCell>
                        <TableCell>
                          {classData.schedules?.map((schedule, i) => (
                            <Chip
                              key={i}
                              label={`${schedule.day} ${schedule.start} - ${schedule.end}`}
                              sx={{ margin: 0.5 }}
                            />
                          )) || <Typography variant="caption">Horário não disponível</Typography>}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={isSelected ? "Remover da Agenda" : "Adicionar à Agenda"}>
                            <IconButton
                              color={isSelected ? "error" : "success"}
                              onClick={() => handleToggleClassInSchedule(classData)}
                            >
                              {isSelected ? <Remove /> : <Add />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Detalhes da Turma">
                            <IconButton color="primary" onClick={() => handleOpenDialog(classData)}>
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
            <Typography variant="body1">Nenhuma cadeira disponível.</Typography>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            height: { xs: '300px', sm: '400px', md: '450px' },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Cadeiras Recomendadas
          </Typography>
          {recommendedSubjects.length > 0 ? (
            <TableContainer
              sx={{
                flex: 1,
                overflowY: 'auto',
              }}
            >
              <Table>
                <TableBody>
                  {recommendedSubjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell>{subject.subject.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1">Nenhuma cadeira recomendada.</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  
      <Box sx={{ marginTop: 4 }}>
        <Paper sx={{ padding: 2 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Sua Agenda
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '120px' }}>Horário</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center' }}>Segunda</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center' }}>Terça</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center' }}>Quarta</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center' }}>Quinta</TableCell>
                  <TableCell sx={{ width: '200px', textAlign: 'center' }}>Sexta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {['8:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'].map(timeSlot => (
                  <TableRow key={timeSlot}>
                    <TableCell sx={{ width: '120px' }}>{timeSlot}</TableCell>
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(day => {
                      const key = `${day} ${timeSlot}`;
                      const classInfo = Object.entries(schedule).find(([k, v]) => k === key);
                      return (
                        <TableCell
                          key={day}
                          sx={{
                            width: '200px',
                            maxWidth: '200px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            backgroundColor: classInfo ? '#e0f7fa' : '#fff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            padding: '8px',
                          }}
                          onClick={() => {
                            if (classInfo) {
                              handleRemoveClassFromSchedule(classInfo[1].subjectName);
                            } else {
                              handleOpenSlotDialog(day, timeSlot);
                            }
                          }}
                        >
                          {classInfo ? (
                            <>
                              <Typography variant="subtitle2" noWrap>{classInfo[1].subjectName}</Typography>
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>
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
          <Button
            variant="contained"
            color="error"
            onClick={() => setSchedule({})}
          >
            Limpar Agenda
          </Button>
      </Box>
  
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Detalhes da Turma</DialogTitle>
        <DialogContent>
          {selectedClass && (
            <>
              <Typography variant="subtitle1">Cadeira: {selectedClass.subject.name}</Typography>
              <Typography variant="subtitle1">Turma: T{selectedClass.classID}</Typography>
              <Typography variant="subtitle1">Horários:</Typography>
              {selectedClass.schedules.map((schedule, i) => (
                <Chip
                  key={i}
                  label={`${schedule.day} ${schedule.start} - ${schedule.end}`}
                  sx={{ margin: 0.5 }}
                />
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>
  
      <Dialog open={slotDialog.open} onClose={handleCloseSlotDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cadeiras Disponíveis para {slotDialog.slotDay}, {slotDialog.slotTime}</DialogTitle>
        <DialogContent>
          <List>
            {slotDialog.availableClasses.length > 0 ? (
              slotDialog.availableClasses.map((classData, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleAddClassToScheduleFromDialog(classData)}>
                    <ListItemText primary={`${classData.subject.name} - T${classData.classID}`} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2">Nenhuma cadeira disponível neste horário.</Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSlotDialog} color="primary">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
  
}

export default DashboardPage;
