import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { 
  COURSES, EXAMS, TODO_TASKS, CUSTOM_SCHEDULES, SPACE_COURSES, 
  MOCK_RESOURCES, INITIAL_HISTORY_LOGS, RECOMMENDATIONS, FOLDERS, 
  SYLLABUS, TEACHER_TODO_TASKS, STUDENT_ANSWERS_LIST, STUDENT_ASKS_LIST, 
  REPORT_AI_SUGGESTIONS, HOMEWORK_LIST, RESOURCE_TAGS, RESOURCE_COURSES, 
  RESOURCES, CLASSES_LIST, STUDENTS_LIST, MISTAKES, REVIEWS, SUBMITTED_STUDENTS 
} from "./serverMockData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GenAI lazily
let aiClient: GoogleGenAI | null = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured yet. AI features will fallback to offline helper modes.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
// Proxy middleware for /api/* targeting the real backend http://192.168.31.234:8080
app.all("/api/*", async (req, res, next) => {
  const path = req.path;
  const method = req.method;
  const token = req.headers.authorization;
  const userId = req.headers['x-user-id'] || '';
  const currentCourseId = req.headers['x-course-id'] || '1';

  // Define URL mappings from frontend route structure to backend route structure
  let targetPath = path;
  if (path === "/api/courses") {
    targetPath = "/api/course/list";
  } else if (path === "/api/exams") {
    targetPath = "/api/exam/list";
  } else if (path === "/api/tasks") {
    targetPath = userId ? `/api/student/tasks/${userId}` : "/api/tasks";
  } else if (path === "/api/space/history-logs") {
    targetPath = userId ? `/api/student/learning-history/${userId}` : "/api/space/history-logs";
  } else if (path === "/api/recommendations") {
    targetPath = userId ? `/api/student/recommendations/${userId}` : "/api/recommendations";
  } else if (path === "/api/sidebar/folders") {
    targetPath = "/api/folder/list";
  } else if (path === "/api/syllabus") {
    targetPath = `/api/course/${currentCourseId}/syllabus`;
  } else if (path === "/api/student/reports") {
    targetPath = userId ? `/api/student/report/${userId}` : "/api/student/reports";
  } else if (path === "/api/space/courses") {
    targetPath = userId ? `/api/student/course-progress/${userId}` : "/api/space/courses";
  } else if (path === "/api/space/resources") {
    targetPath = "/api/resource/favorites";
  } else if (path === "/api/space/mistakes" || path === "/api/space/mistakes-detail") {
    targetPath = "/api/mistake/list";
  } else if (path === "/api/space/reviews") {
    targetPath = "/api/diagnosis/history";
  } else if (path === "/api/teacher/tasks") {
    targetPath = userId ? `/api/teacher/dashboard/${userId}` : "/api/teacher/tasks";
  } else if (path === "/api/teacher/courses") {
    targetPath = userId ? `/api/teacher/class/list/${userId}` : "/api/teacher/courses";
  } else if (path === "/api/teacher/users") {
    targetPath = "/api/admin/user/list";
  } else if (path === "/api/teacher/papers") {
    targetPath = "/api/exam/list";
  } else if (path === "/api/teacher/pool-questions" || path === "/api/teacher/questions") {
    targetPath = "/api/admin/knowledge-point";
  } else if (path === "/api/chat") {
    targetPath = "/api/agent/chat";
  }

  // Preserve query parameters if any
  const queryStr = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  const backendUrl = `http://192.168.31.234:8080${targetPath}${queryStr}`;

  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && key.toLowerCase() !== 'host') {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value as string);
        }
      }
    }

    if (token) {
      headers.set("Authorization", token);
    }

    const fetchOptions: any = {
      method: method,
      headers: headers,
    };

    if (method !== "GET" && method !== "HEAD") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const backendResponse = await fetch(backendUrl, fetchOptions);

    if (backendResponse.ok || (backendResponse.status !== 404 && backendResponse.status !== 500)) {
      const contentType = backendResponse.headers.get("content-type");
      
      backendResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });
      
      res.status(backendResponse.status);

      if (contentType && contentType.includes("application/json")) {
        const json: any = await backendResponse.json();
        
        if (json && typeof json === 'object' && json.success === true && 'data' in json) {
          res.json(json.data);
        } else {
          res.json(json);
        }
      } else {
        const buffer = await backendResponse.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
      return;
    }
  } catch (error: any) {
    console.warn(`Backend proxy failed for ${method} ${path}, falling back to mock:`, error.message);
  }

  // Fallback to Express mock endpoints
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Student Portal Endpoints
app.get("/api/courses", (req, res) => {
  res.json(COURSES);
});

app.get("/api/exams", (req, res) => {
  res.json(EXAMS);
});

app.get("/api/tasks", (req, res) => {
  res.json(TODO_TASKS);
});

app.get("/api/schedules", (req, res) => {
  res.json(CUSTOM_SCHEDULES);
});

app.get("/api/space/courses", (req, res) => {
  res.json(SPACE_COURSES);
});

app.get("/api/space/resources", (req, res) => {
  res.json(MOCK_RESOURCES);
});

app.get("/api/space/mistakes", (req, res) => {
  res.json(MISTAKES);
});

app.get("/api/space/reviews", (req, res) => {
  res.json(REVIEWS);
});

app.get("/api/space/history-logs", (req, res) => {
  res.json(INITIAL_HISTORY_LOGS);
});

app.get("/api/recommendations", (req, res) => {
  res.json(RECOMMENDATIONS);
});

app.get("/api/sidebar/folders", (req, res) => {
  res.json(FOLDERS);
});

app.get("/api/syllabus", (req, res) => {
  res.json(SYLLABUS);
});

// Teacher Dashboard Endpoints
app.get("/api/teacher/tasks", (req, res) => {
  res.json(TEACHER_TODO_TASKS);
});

app.get("/api/teacher/answers", (req, res) => {
  res.json(STUDENT_ANSWERS_LIST);
});

app.get("/api/teacher/asks", (req, res) => {
  res.json(STUDENT_ASKS_LIST);
});

app.get("/api/teacher/suggestions", (req, res) => {
  res.json(REPORT_AI_SUGGESTIONS);
});

app.get("/api/teacher/homeworks", (req, res) => {
  res.json(HOMEWORK_LIST);
});

app.get("/api/teacher/resource-tags", (req, res) => {
  res.json(RESOURCE_TAGS);
});

app.get("/api/teacher/resource-courses", (req, res) => {
  res.json(RESOURCE_COURSES);
});

app.get("/api/teacher/resources", (req, res) => {
  res.json(RESOURCES);
});

app.get("/api/teacher/classes", (req, res) => {
  res.json(CLASSES_LIST);
});

app.get("/api/teacher/students", (req, res) => {
  res.json(STUDENTS_LIST);
});

app.get("/api/teacher/submissions", (req, res) => {
  res.json(SUBMITTED_STUDENTS);
});

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const ai = getGenAI();
    if (!ai) {
      // Offline fallback handlers
      let reply = "您好！我是您的智能学业助手。当前未检测到配置的 GEMINI_API_KEY，我正在本地学术助手模式下为您提供支持。关于我们最近的课程《机器学习基础》评估指标，你有任何问题吗？";
      
      const lower = message.toLowerCase();
      if (lower.includes("mse") || lower.includes("均方误差")) {
        reply = "均方误差 (MSE, Mean Squared Error) 是预测值与真实值误差的平方的平均值。其公式如下：\n\n$$\\text{MSE} = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2$$\n\n**特点：**\n1. 由于平方项的存在，它会对**较大误差**进行重罚（敏感于离群点 / 异常值）。\n2. 它是可导的，非常便于用作梯度下降的损失函数。";
      } else if (lower.includes("mae") || lower.includes("绝对误差") || lower.includes("平均绝对误差")) {
        reply = "平均绝对误差 (MAE, Mean Absolute Error) 是预测值与真实值绝对误差的平均值。其公式如下：\n\n$$\\text{MAE} = \\frac{1}{n} \\sum_{i=1}^{n} |y_i - \\hat{y}_i|$$\n\n**特点：**\n1. 由于没有进行平方计算，它对异常具有很强的**鲁棒性**（对离群点不那么敏感）。\n2. 它在 0 处不可导，在最优化计算中比 MSE 稍微复杂一点。";
      } else if (lower.includes("代码") || lower.includes("python") || lower.includes("计算")) {
        reply = "在 Python 中计算评估指标非常简单，通常可以用 NumPy 或 Scikit-Learn 快速实现：\n\n```python\nimport numpy as np\ny_true = np.array([3.0, -0.5, 2.0, 7.0, 4.5])\ny_pred = np.array([2.5, 0.0, 2.0, 8.0, 4.0])\n\n# 手写计算\nmse = np.mean((y_true - y_pred) ** 2)\nmae = np.mean(np.abs(y_true - y_pred))\n\nprint(f\"MSE: {mse:.4f}\") # 输出 0.28\nprint(f\"MAE: {mae:.4f}\") # 输出 0.40\n```";
      } else if (lower.includes("你好") || lower.includes("在吗") || lower.includes("你是谁")) {
        reply = "你好！我是您的智学平台 AI 助手。我可以为您提供学术指导、代码调试、算法推导及错题讲解服务。请问今天有什么想学习的吗？您可以选择一门课程继续学习，例如：《机器学习基础》。";
      } else if (lower.includes("考试") || lower.includes("测验")) {
        reply = "我们今晚 19:00 将在考试中心进行《机器学习基础》第三章知识点测验。考试时长 90 分钟，题型涵盖单选题、多选题、判断题和简答题。建议您提前复习 MSE、MAE 及线性回归公式推导！";
      }
      
      return res.json({ text: reply });
    }

    const sysInstruction = `You are a professional, helpful, and highly intelligent academic study assistant for "智学平台" (ZhiXue Platform), an advanced online learning system.
You are helping a student named "李同学" (Student Li). Focus on explaining machine learning (like MSE, MAE, linear regression, gradient descent), data structures, Python, and mathematics.
Keep your replies concise, structured, friendly, encouraging, and academic. Always respond in Simplified Chinese (简体中文). Feel free to use Markdown formatting and mathematical equations or code blocks.`;

    const chatHistory = history ? history.map((h: any) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.text || h.content || "" }]
    })) : [];

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: sysInstruction,
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI response" });
  }
});

// Vite Middleware Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
