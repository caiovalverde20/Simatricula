import React from 'react';
import { Paper, Grid, Typography } from '@mui/material';

const StudentInfo = ({ studentData, completedCredits, curriculumInfo, theme }) => {
  return (
    <Paper
      sx={{
        padding: 2,
        marginTop: 2,
        backgroundColor: theme === 'light' ? '#ffffff' : '#424242',
        color: theme === 'light' ? '#000000' : '#ffffff',
      }}
    >
      <Grid container spacing={2}>
        {/* Informações do estudante */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Matrícula: {studentData?.matricula_do_estudante}</Typography>
          <Typography variant="subtitle1">Curso: {studentData?.nome_do_curso}</Typography>
          <Typography variant="subtitle1">Grade: {studentData?.codigo_do_curriculo}</Typography>
          <Typography variant="subtitle1">Períodos Completos: {studentData?.periodos_completados}</Typography>
        </Grid>

        {/* Informações de créditos */}
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">
            Créditos Obrigatórios: {completedCredits.mandatory}/{curriculumInfo?.minimo_creditos_disciplinas_obrigatorias ?? 'Carregando...'}
          </Typography>
          <Typography variant="subtitle1">
            Créditos Opcionais: {completedCredits.optional}/{curriculumInfo?.minimo_creditos_disciplinas_optativas ?? 'Carregando...'}
          </Typography>
          <Typography variant="subtitle1">
            Créditos Complementares: {completedCredits.complementary}/{curriculumInfo?.minimo_creditos_atividades_complementares ?? 'Carregando...'}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StudentInfo;
