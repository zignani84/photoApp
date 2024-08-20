# React Native Photo App

## Descrição

Este aplicativo permite ao usuário tirar uma foto usando a câmera do celular, capturar a geolocalização no momento da captura da foto e enviar a foto e a geolocalização para uma API Laravel.

## Configuração e Execução

### Pré-requisitos

- Node.js
- Yarn (opcional, mas recomendado)
- Android Studio (para testar no Android)

### Passos para Instalação

1. Clone o repositório:

   ```bash
   git clone <URL_DO_REPOSITÓRIO>
   cd <project>
   ```

2. Instale as dependências:

   ```bash
   yarn install
   # ou
   npm install
   ```

3. Execute o aplicativo no Android:

   ```bash
   npx react-native run-android
   # ou
   npx react-native start
   # teclar 'a' para rodar o app no emulador android
   ```

4. Se tiver problemas com Network Error, o endpoint deve ser alterado no App.tsx - Para saber qual o IP da API, o projeto do photoApi do Laravel deve estar rodando e execute este comando fora do bash do container do docker:

    ```bash
    docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' nginx
    ```

### Bibliotecas Utilizadas

- react-native-vision-camera (para tirar fotos)
- react-native-geolocation-service (para obter a geolocalização)
- axios (para enviar dados para a API Laravel)

### Estrutura do Projeto

- App.tsx - Arquivo principal do aplicativo

### Instruções Adicionais

Certifique-se de que o emulador ou dispositivo Android esteja configurado corretamente.
A API Laravel deve estar rodando para que o aplicativo possa enviar dados.
