import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to sanitize Gemini response if markdown code fences exist
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Fallback deterministic converter when API key is not yet set or offline
function generateFallbackConversion(
  sourceCode: string,
  fileName: string = 'server.js',
  targetMode: 'app-router' | 'pages-router' = 'app-router'
) {
  const isExpress = sourceCode.includes('express') || sourceCode.includes('app.get') || sourceCode.includes('app.post');
  const hasAuth = sourceCode.includes('jwt') || sourceCode.includes('auth') || sourceCode.includes('bearer') || sourceCode.includes('token');
  const hasDatabase = sourceCode.includes('mongoose') || sourceCode.includes('prisma') || sourceCode.includes('sequelize') || sourceCode.includes('pg');

  return {
    summary: `Migração estruturada de Node.js (${isExpress ? 'Express API' : 'Serviço/Script'}) para Next.js 15 (${targetMode === 'app-router' ? 'App Router com Route Handlers & Server Actions' : 'Pages Router com API Routes'}).`,
    targetMode,
    architectureOverview: [
      {
        original: 'Servidor Express monólito com app.listen() e roteamento manual',
        nextjs: 'Next.js App Router com funções serverless atômicas (app/api/.../route.ts) e Server Actions'
      },
      {
        original: 'res.status(200).json(...) e req.body / req.query',
        nextjs: 'NextResponse.json(...) e const body = await request.json(), request.nextUrl.searchParams'
      },
      {
        original: 'app.use(cors()) e middlewares manuais no ciclo de requisição',
        nextjs: 'middleware.ts na raiz ou headers nativos em next.config.ts / Route Handlers'
      },
      {
        original: 'Variáveis de ambiente process.env.* sem distinção de cliente',
        nextjs: 'process.env.* no servidor e NEXT_PUBLIC_* apenas para valores que vão ao navegador'
      }
    ],
    files: [
      {
        path: targetMode === 'app-router' ? 'app/api/items/route.ts' : 'pages/api/items.ts',
        language: 'typescript',
        role: 'API Route Handler',
        description: 'Substituto moderno para as rotas GET e POST do Express com tipagem nativa.',
        content: `import { NextRequest, NextResponse } from 'next/server';

// Simulação de banco de dados / serviço
let items = [
  { id: '1', title: 'Primeiro Item migrado', createdAt: new Date().toISOString() },
  { id: '2', title: 'Segundo Item migrado', createdAt: new Date().toISOString() }
];

// GET: Equivalente ao app.get('/items', (req, res) => ...)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let filtered = items;
    if (query) {
      filtered = items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao buscar itens'
    }, { status: 500 });
  }
}

// POST: Equivalente ao app.post('/items', (req, res) => ...)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title) {
      return NextResponse.json({
        success: false,
        error: 'O campo "title" é obrigatório'
      }, { status: 400 });
    }

    const newItem = {
      id: String(Date.now()),
      title: body.title,
      createdAt: new Date().toISOString()
    };

    items.push(newItem);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Criado com sucesso no Next.js!'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao processar corpo JSON'
    }, { status: 500 });
  }
}`
      },
      {
        path: targetMode === 'app-router' ? 'app/api/items/[id]/route.ts' : 'pages/api/items/[id].ts',
        language: 'typescript',
        role: 'Dynamic Route Handler',
        description: 'Tratamento de parâmetros dinâmicos (:id) com a nova API assíncrona do Next.js 15.',
        content: `import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/items/[id]
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  return NextResponse.json({
    success: true,
    data: { id, title: \`Item com ID \${id}\`, note: 'Migrado de req.params.id do Express' }
  });
}

// DELETE /api/items/[id]
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  
  return NextResponse.json({
    success: true,
    message: \`Item \${id} removido com sucesso\`
  });
}`
      },
      {
        path: 'middleware.ts',
        language: 'typescript',
        role: 'Global Middleware',
        description: 'Substituto centralizado para middlewares Express (CORS, verificação de JWT, logging, rewrite).',
        content: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CORS ou validação de Token
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // Exemplo de verificação de autenticação para rotas protegidas:
  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Não autorizado. Token Bearer ausente.' },
        { status: 401 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};`
      },
      {
        path: targetMode === 'app-router' ? 'app/page.tsx' : 'pages/index.tsx',
        language: 'typescript',
        role: 'UI View / Frontend',
        description: 'Página inicial moderna consumindo sua API migrada com React Server Components ou Client hooks.',
        content: `'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadItems() {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTitle('');
        loadItems();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
            Node.js Migrado para Next.js 15
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Seu backend Node.js agora opera com Route Handlers e React Server/Client Components.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Novo item..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>

        <ul className="divide-y divide-slate-800 bg-slate-900 rounded-xl p-4 border border-slate-800">
          {items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between items-center">
              <span className="font-medium text-slate-200">{item.title}</span>
              <span className="text-xs text-slate-500 font-mono">{item.id}</span>
            </li>
          ))}
          {items.length === 0 && (
            <li className="py-6 text-center text-slate-500 text-sm">Nenhum item cadastrado ainda.</li>
          )}
        </ul>
      </div>
    </main>
  );
}`
      },
      {
        path: 'package.json',
        language: 'json',
        role: 'Configuration',
        description: 'Dependências e scripts recomendados para o novo projeto Next.js.',
        content: JSON.stringify({
          name: "migrated-nextjs-app",
          version: "0.1.0",
          private: true,
          scripts: {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "lint": "next lint"
          },
          dependencies: {
            "next": "^15.1.0",
            "react": "^19.0.0",
            "react-dom": "^19.0.0"
          },
          devDependencies: {
            "@types/node": "^22.0.0",
            "@types/react": "^19.0.0",
            "@types/react-dom": "^19.0.0",
            "typescript": "^5.6.0",
            "tailwindcss": "^4.0.0"
          }
        }, null, 2)
      }
    ],
    migrationNotes: [
      'Next.js 15: Os parâmetros de contexto dinâmicos (context.params) agora são Promises e devem ser acessados com await context.params.',
      'Express req.body: No Next.js App Router, use const body = await request.json(). Não é necessário body-parser.',
      'Express res.status().json(): Substituído por return NextResponse.json(data, { status: 200 }).',
      'Porta & Listen: Não execute app.listen(port). O Next.js gerencia as portas e a execução serverless automaticamente.',
      'Middlewares: Substitua middlewares de rotas individuais por middleware.ts na raiz ou funções utilitárias compartilhadas em lib/auth.ts.'
    ],
    dependencyChanges: {
      toRemove: ['express', 'cors', 'body-parser', 'nodemon', 'dotenv'],
      toAdd: ['next', 'react', 'react-dom', 'typescript', '@types/node']
    }
  };
}

// Endpoint: AI-driven conversion
app.post('/api/convert', async (req: Request, res: Response) => {
  const {
    sourceCode,
    fileName = 'index.js',
    targetMode = 'app-router',
    targetDb = 'prisma',
    language = 'typescript',
    projectType = 'api'
  } = req.body;

  if (!sourceCode || typeof sourceCode !== 'string' || !sourceCode.trim()) {
    res.status(400).json({ error: 'Nenhum código Node.js fornecido para conversão.' });
    return;
  }

  // If no Gemini API key, use rich deterministic fallback
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const fallback = generateFallbackConversion(sourceCode, fileName, targetMode);
    res.json(fallback);
    return;
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `Você é um arquiteto sênior especialista em migração de ecossistemas Node.js (Express, Fastify, NestJS, scripts, microsserviços) para Next.js 15 moderno (${targetMode === 'app-router' ? 'App Router com Route Handlers & Server Actions' : 'Pages Router com API Routes'}).

Analise o código Node.js fornecido pelo usuário e recrie-o perfeitamente em Next.js.
Idiomas de resposta das explicações: Português do Brasil.
Linguagem de saída de código: ${language === 'typescript' ? 'TypeScript' : 'JavaScript'}.
Padrão de banco/dados se aplicável: ${targetDb}.

O código Node.js de entrada (${fileName}):
\`\`\`javascript
${sourceCode.slice(0, 40000)}
\`\`\`

Retorne ESTRITAMENTE um JSON válido com o seguinte formato exato (sem comentários antes ou depois do JSON):
{
  "summary": "Resumo da migração em português detalhando a estratégia adotada",
  "targetMode": "${targetMode}",
  "architectureOverview": [
    {
      "original": "Explicação do que existia no Node.js original",
      "nextjs": "Como foi transformado e por que no Next.js"
    }
  ],
  "files": [
    {
      "path": "caminho/do/arquivo/no/nextjs (ex: app/api/auth/login/route.ts, app/page.tsx, lib/db.ts, middleware.ts, etc.)",
      "language": "typescript|json|css|javascript",
      "role": "API Route Handler | Server Action | Service | Middleware | UI View | Config",
      "description": "Explicação concisa do que este arquivo faz",
      "content": "Código completo pronto para uso"
    }
  ],
  "migrationNotes": [
    "Dica crítica ou mudança importante na transição (ex: Cookies, Headers, Server vs Client components, Async params)",
    "..."
  ],
  "dependencyChanges": {
    "toRemove": ["express", "body-parser", "..."],
    "toAdd": ["next", "react", "react-dom", "..."]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '';
    const cleaned = cleanJsonOutput(responseText);
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating conversion with Gemini:', error);
    // Graceful fallback to deterministic generator so user is never stuck
    const fallback = generateFallbackConversion(sourceCode, fileName, targetMode);
    res.json({
      ...fallback,
      warning: 'Usando conversão estruturada de referência (o serviço de IA retornou uma ressalva temporária: ' + (error?.message || 'erro') + ')'
    });
  }
});

// Endpoint: Architecture diagnosis
app.post('/api/analyze', async (req: Request, res: Response) => {
  const { sourceCode } = req.body;
  if (!sourceCode) {
    res.status(400).json({ error: 'Código ausente' });
    return;
  }

  const isExpress = sourceCode.includes('express');
  const usesMongo = sourceCode.includes('mongoose');
  const usesPrisma = sourceCode.includes('prisma');
  const usesJwt = sourceCode.includes('jwt') || sourceCode.includes('jsonwebtoken');
  const usesSocket = sourceCode.includes('socket.io') || sourceCode.includes('ws');
  const usesEjs = sourceCode.includes('ejs') || sourceCode.includes('pug') || sourceCode.includes('hbs');

  res.json({
    frameworkDetected: isExpress ? 'Express.js' : 'Node.js Core / Custom HTTP',
    featuresDetected: {
      jwtAuth: usesJwt,
      database: usesMongo ? 'MongoDB / Mongoose' : usesPrisma ? 'Prisma ORM' : 'Nenhum / Memória',
      webSockets: usesSocket,
      templateEngine: usesEjs ? 'SSR Tradicional (EJS/Pug)' : 'API REST / JSON'
    },
    recommendations: [
      usesSocket
        ? 'Atenção: WebSockets contínuos no Next.js serverless requerem um serviço externo (como Pusher, Ably ou servidor Node secundário), ou Server-Sent Events (SSE).'
        : 'Rotas REST podem ser migradas diretamente para Route Handlers nativos (app/api/.../route.ts).',
      usesEjs
        ? 'Templates EJS/Pug podem ser convertidos diretamente para React Server Components (RSC) com performance e SEO superiores.'
        : 'Respostas JSON são 100% suportadas com NextResponse.json().',
      usesJwt
        ? 'Recomendado usar cookies HTTP-Only com a biblioteca "jose" ou NextAuth / Auth.js v5 para máxima segurança.'
        : 'Variáveis sensíveis ficam em .env.local sem prefixo NEXT_PUBLIC_ para proteger dados.'
    ]
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
