# Stage 1: Build do Frontend com Node
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia código fonte e realiza o build da aplicação
COPY . .
RUN npm run build

# Stage 2: Servir os arquivos com Nginx
FROM nginx:alpine

# Copia os arquivos gerados pelo Vite no build
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx com suporte a SPA e proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
