# Use a imagem oficial do Node.js como base
FROM node:18

# Configura o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto para o contêiner
COPY package.json package-lock.json ./
COPY . .

# Instala as dependências do projeto
RUN npm install

# Exponha a porta usada pelo servidor de desenvolvimento
EXPOSE 8081

# Comando padrão para iniciar o servidor de desenvolvimento
CMD ["npm", "start"]
