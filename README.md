
# Simatrícula: Sistema de Planejamento de Matrículas da UFCG

Simatrícula é uma aplicação web desenvolvida para ajudar os estudantes da Universidade Federal de Campina Grande (UFCG) no processo de matrícula. O sistema se conecta à API Eureka da UFCG para fornecer dados em tempo real sobre disciplinas, horários e turmas, tornando o processo mais rápido, eficiente e sem conflitos.

## Demonstração

Assista ao vídeo de demonstração do Simatrícula no link abaixo:

[Assista à Demonstração](https://drive.google.com/file/d/1h15h72dnNq3c15kYy1pyCR_2Kgss8465/view?usp=sharing)

> **Nota**: Você pode clicar no link acima para acessar o vídeo de demonstração hospedado no Google Drive.

## Deploy

Acesse o Simatrícula através do link abaixo:

[Simatrícula - Deploy](https://simatricula.vercel.app/)

## Funcionalidades

- **Autenticação com Controle Acadêmico**: Login com segurança usando credenciais do Controle Acadêmico da UFCG.
- **Simulação de Matrícula**: Permite adicionar/remover disciplinas em uma grade interativa.
- **Detecção Automática de Conflitos de Horários**: Notificação automática de conflitos de horário entre disciplinas selecionadas.
- **Pesquisa por Disciplinas**: Busca rápida por nome ou código de disciplinas.
- **Gerenciamento de Múltiplas Agendas**: Criação e comparação de diferentes combinações de horários.
- **Modo Claro e Escuro**: Alternância entre temas claro e escuro conforme a preferência do usuário.

## Instalação

Siga os passos abaixo para instalar e rodar o projeto localmente:

### 1. Clonar o repositório

```bash
git clone https://github.com/caiovalverde20/Simatricula.git
cd Simatricula
```

### 2. Instalar dependências

Execute o comando abaixo para instalar todas as dependências do projeto:

```bash
npm install
```

### 3. Executar o projeto

Para rodar o projeto em modo de desenvolvimento, utilize o comando:

```bash
npm start
```

Abra [http://localhost:3000](http://localhost:3000) para visualizar o projeto no navegador.

## Scripts Disponíveis

No diretório do projeto, você pode executar os seguintes comandos:

- `npm start`: Executa o aplicativo no modo de desenvolvimento.
  - Abra [http://localhost:3000](http://localhost:3000) para visualizar no navegador.
- `npm test`: Executa o test runner no modo interativo.
- `npm run build`: Constrói o app para produção na pasta `build`. Os arquivos são minificados e otimizados para melhor performance.
- `npm run eject`: **Nota**: Uma vez que você execute `eject`, não há como voltar atrás! Isso permite acesso a todas as configurações do projeto, mas é irreversível.

## Contribuições

Contribuições são bem-vindas! Se quiser contribuir:

1. Faça um fork do repositório.
2. Crie uma nova branch para sua funcionalidade ou correção:

```bash
git checkout -b minha-nova-feature
```

3. Faça o commit das suas mudanças:

```bash
git commit -m 'Adiciona nova feature'
```

4. Envie a branch:

```bash
git push origin minha-nova-feature
```

5. Abra um Pull Request.
