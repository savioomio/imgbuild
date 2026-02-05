# ImgBuild - Processador de Imagens Moderno

ImgBuild é um aplicativo desktop moderno para facilitar o processamento de imagens, com um design premium clean e dourado.

![Logo](icon.png)

## Funcionalidades

- **Otimização Inteligente**: Reduza o tamanho das imagens mantendo a qualidade.
- **Conversão WebP**: Converta imagens para o formato WebP moderno.
- **Compressão**: Controle total sobre a qualidade da compressão.
- **Redimensionamento**: Redimensione imagens facilmente.
- **Design Moderno**: Interface Glassmorphism, Clean e intuitiva.
- **Drag & Drop**: Arraste e solte imagens em qualquer lugar da tela.
- **Histórico de Salvamento**: Notificações e histórico fácil de acesso aos arquivos salvos.

## Tecnologias

- **Electron** (Cross-platform Desktop)
- **React + Vite** (UI e Performance)
- **Tailwind CSS** (Estilização Premium)
- **Sharp** (Processamento de Imagem de Alta Performance)
- **Lucide Icons** (Ícones Profissionais)

## Como Rodar

1. Instale as dependências:

```bash
npm install
```

2. Rode em desenvolvimento:

```bash
npm run electron:dev
```

## Como Buildar (Gerar Executável)

Para gerar os executáveis para Windows, Mac e Linux:

```bash
npm run electron:build
```

Os arquivos serão gerados na pasta `release`.
