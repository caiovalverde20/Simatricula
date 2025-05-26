import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Add } from "@mui/icons-material";

const ScheduleTable = ({
  agendas,
  currentAgendaIndex,
  handleRemoveClassFromSchedule,
  handleClearAgenda,
  handleSwitchAgenda,
  handleAddAgenda,
  theme,
  availableClasses,
  handleAddClassToSchedule,
}) => {
  const timeSlots = ["8:00-10:00", "10:00-12:00", "14:00-16:00", "16:00-18:00"];
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [availableClassesForSlot, setAvailableClassesForSlot] = useState([]);

  const dayMapping = {
    2: "Segunda",
    3: "Terça",
    4: "Quarta",
    5: "Quinta",
    6: "Sexta",
  };

  const handleOpenModal = (day, timeSlot) => {
    setSelectedDay(day);
    setSelectedTimeSlot(timeSlot);

    const filteredClasses = availableClasses.filter((classData) => {
      const matchesTimeSlot = classData.schedules.some((schedule) => {
        const mappedDay = dayMapping[schedule.day];
        return (
          mappedDay === day &&
          schedule.start === timeSlot.split("-")[0] &&
          schedule.end === timeSlot.split("-")[1]
        );
      });

      const hasSameSubjectConflict = Object.values(
        agendas[currentAgendaIndex],
      ).some(
        (item) =>
          item.subjectName === classData.nome_da_disciplina &&
          item.classID !== classData.turma,
      );

      return matchesTimeSlot && !hasSameSubjectConflict;
    });

    setAvailableClassesForSlot(filteredClasses);
    setOpenDialog(true);
  };

  const handleCloseModal = () => {
    setOpenDialog(false);
  };

  const handleAddClass = (classData) => {
    handleAddClassToSchedule(classData);
    setOpenDialog(false);
  };

  return (
    <Box sx={{ marginTop: 4 }}>
      <Paper
        sx={{
          padding: 2,
          backgroundColor: theme === "light" ? "#ffffff" : "#424242",
          color: theme === "light" ? "#000000" : "#ffffff",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Sua Agenda
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: "120px",
                    backgroundColor: theme === "light" ? "#e0e0e0" : "#616161",
                    color: theme === "light" ? "#000000" : "#ffffff",
                  }}
                >
                  Horário
                </TableCell>
                {days.map((day) => (
                  <TableCell
                    key={day}
                    sx={{
                      width: "200px",
                      textAlign: "center",
                      backgroundColor:
                        theme === "light" ? "#e0e0e0" : "#616161",
                      color: theme === "light" ? "#000000" : "#ffffff",
                    }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.map((timeSlot) => (
                <TableRow key={timeSlot}>
                  <TableCell
                    sx={{
                      width: "120px",
                      color: theme === "light" ? "#000000" : "#ffffff",
                    }}
                  >
                    {timeSlot}
                  </TableCell>
                  {days.map((day) => {
                    const dayNumber = Object.keys(dayMapping).find(
                      (key) => dayMapping[key] === day,
                    );
                    const key = `${dayNumber} ${timeSlot}`;
                    const classInfo = agendas[currentAgendaIndex]?.[key];

                    return (
                      <Tooltip
                        title={
                          classInfo
                            ? "Clique para remover a disciplina da agenda"
                            : "Clique para adicionar uma disciplina"
                        }
                        key={day}
                      >
                        <TableCell
                          sx={{
                            width: "200px",
                            maxWidth: "200px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            backgroundColor: classInfo
                              ? theme === "light"
                                ? "#e0f7fa"
                                : "#37474f"
                              : theme === "light"
                                ? "#fff"
                                : "#303030",
                            cursor: classInfo ? "pointer" : "default",
                            textAlign: "center",
                            padding: "8px",
                            position: "relative",
                            color: theme === "light" ? "#000000" : "#ffffff",
                            "&:hover": {
                              backgroundColor: classInfo
                                ? theme === "light"
                                  ? "#ffcdd2"
                                  : "#ff7961"
                                : theme === "light"
                                  ? "#f0f0f0"
                                  : "#424242",
                            },
                          }}
                          onClick={() => {
                            if (classInfo) {
                              handleRemoveClassFromSchedule(
                                classInfo.subjectName,
                              );
                            } else {
                              handleOpenModal(day, timeSlot);
                            }
                          }}
                        >
                          {classInfo ? (
                            <Typography
                              variant="subtitle2"
                              noWrap
                              sx={{
                                color:
                                  theme === "light" ? "#000000" : "#ffffff",
                              }}
                            >
                              {classInfo.subjectName}
                            </Typography>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "#aaa",
                              }}
                            >
                              <Add fontSize="small" />
                              <Typography variant="caption">
                                Adicionar Disciplina
                              </Typography>
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

        {/* Modal para exibir disciplinas disponíveis no horário específico */}
        <Dialog
          open={openDialog}
          onClose={handleCloseModal}
          PaperProps={{
            style: {
              backgroundColor: theme === "light" ? "#ffffff" : "#424242",
              color: theme === "light" ? "#000000" : "#ffffff",
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: theme === "light" ? "#ffffff" : "#424242",
              color: theme === "light" ? "#000000" : "#ffffff",
            }}
          >
            Disciplinas Disponíveis para {selectedDay} {selectedTimeSlot}
          </DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: theme === "light" ? "#ffffff" : "#424242",
              color: theme === "light" ? "#000000" : "#ffffff",
            }}
          >
            <List>
              {availableClassesForSlot.length > 0 ? (
                availableClassesForSlot.map((classData) => (
                  <ListItem
                    button
                    key={classData.turma}
                    onClick={() => handleAddClass(classData)}
                  >
                    <ListItemText
                      primary={`${classData.nome_da_disciplina} (${classData.turma})`}
                      sx={{ color: theme === "light" ? "#000000" : "#ffffff" }}
                    />
                  </ListItem>
                ))
              ) : (
                <Typography
                  sx={{ color: theme === "light" ? "#000000" : "#ffffff" }}
                >
                  Nenhuma disciplina disponível neste horário.
                </Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions
            sx={{ backgroundColor: theme === "light" ? "#ffffff" : "#424242" }}
          >
            <Button
              onClick={handleCloseModal}
              sx={{ color: theme === "light" ? "#000000" : "#ffffff" }}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      <Box sx={{ marginTop: 2, textAlign: "center" }}>
        <Button variant="contained" color="error" onClick={handleClearAgenda}>
          Limpar Agenda Atual
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1,
          marginBottom: 2,
          marginTop: 4,
        }}
      >
        {agendas.map((_, index) => (
          <Button
            key={index}
            variant={index === currentAgendaIndex ? "contained" : "outlined"}
            onClick={() => handleSwitchAgenda(index)}
            sx={{
              backgroundColor:
                index === currentAgendaIndex
                  ? theme === "light"
                    ? "#e0e0e0"
                    : "#616161"
                  : "inherit",
              color: theme === "light" ? "#000000" : "#ffffff",
            }}
          >
            {index + 1}
          </Button>
        ))}
        <IconButton color="primary" onClick={handleAddAgenda}>
          <Add />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ScheduleTable;
