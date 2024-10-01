import React, { useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  TextField,
  CircularProgress,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const DisciplinaTable = ({
  classesData,  
  searchTerm,  
  onSearchChange, 
  onToggleClass,
  loading,   
  theme,   
  schedule,
  showSnackbar, 
}) => {
  
  const filteredClasses = useMemo(() => {
    return classesData.filter((classData) =>
      classData.nome_da_disciplina.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classesData, searchTerm]);

  const handleToggleClass = useCallback((classData) => {
    const hasSameSubjectConflict = Object.values(schedule).some(
      (item) => item.subjectName === classData.nome_da_disciplina && item.classID !== classData.turma
    );

    if (hasSameSubjectConflict) {
      showSnackbar(`Já existe uma turma da disciplina ${classData.nome_da_disciplina} na sua agenda!`, 'warning');
      return;
    }

    onToggleClass(classData);
  }, [onToggleClass, schedule, showSnackbar]);

  return (
    <Paper sx={{ 
        padding: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        backgroundColor: theme === 'light' ? '#ffffff' : '#424242', 
        color: theme === 'light' ? '#000000' : '#ffffff',
        overflowY: 'auto',  
        maxHeight: '61vh',
        minHeight: '61vh', 
        scrollbarWidth: 'thin',  
    }}>

      {/* Campo de pesquisa */}
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          label="Pesquisar Disciplina"
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

      {/* Indicador de carregamento */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }} />
          <Typography variant="body1" sx={{ marginLeft: 2, color: theme === 'light' ? '#000000' : '#ffffff' }}>
            Carregando disciplinas...
          </Typography>
        </Box>
      ) : filteredClasses.length > 0 ? (
        <TableContainer sx={{ flex: 1, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Disciplina</TableCell>
                <TableCell sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Turma</TableCell>
                <TableCell sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Horários</TableCell>
                <TableCell align="center" sx={{ backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClasses.map((classData, index) => {
                const isSelected = Object.values(schedule).some(
                  (item) => item.subjectName === classData.nome_da_disciplina && item.classID === classData.turma
                );

                const hasSameSubjectConflict = Object.values(schedule).some(
                  (item) => item.subjectName === classData.nome_da_disciplina && item.classID !== classData.turma
                );

                const hasTimeConflict = classData.schedules?.some((scheduleItem) => {
                  const key = `${scheduleItem.day} ${scheduleItem.start}-${scheduleItem.end}`;
                  return schedule[key] && schedule[key].subjectName !== classData.nome_da_disciplina;
                });

                const rowBackgroundColor = isSelected
                  ? theme === 'light' ? '#e0f2f1' : '#37474f'
                  : hasSameSubjectConflict || hasTimeConflict
                  ? theme === 'light' ? '#fff8e1' : '#665c00'
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
                      transition: 'background-color 0.3s ease',
                      color: theme === 'light' ? '#000000' : '#ffffff',
                    }}
                    onDoubleClick={() => handleToggleClass(classData)}
                  >
                    {/* Nome da disciplina */}
                    <TableCell sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>
                      {classData.nome_da_disciplina}
                    </TableCell>

                    {/* Número da turma */}
                    <TableCell sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>
                      T{classData.turma}
                    </TableCell>

                    {/* Horários da disciplina */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {classData.schedules?.map((schedule, i) => (
                          <Chip
                            key={i}
                            label={`${schedule.day} ${schedule.start} - ${schedule.end}`}
                            sx={{ margin: 0.5, backgroundColor: theme === 'light' ? '#e0e0e0' : '#616161', color: theme === 'light' ? '#000000' : '#ffffff' }}
                          />
                        )) || (
                          <Typography variant="caption" sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>
                            Horário não disponível
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Botão de Ação (Adicionar/Remover) */}
                    <TableCell align="center">
                      <Tooltip title={isSelected ? "Remover da Agenda" : "Adicionar à Agenda"}>
                        <IconButton
                          color={isSelected ? "error" : "success"}
                          onClick={() => handleToggleClass(classData)}
                          sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}
                        >
                          {isSelected ? <Remove /> : <Add />}
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
        <Typography variant="body1" align="center" sx={{ color: theme === 'light' ? '#000000' : '#ffffff' }}>
          Nenhuma disciplina disponível.
        </Typography>
      )}
    </Paper>
  );
};

export default DisciplinaTable;
