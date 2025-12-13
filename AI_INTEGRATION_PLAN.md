# 🤖 План интеграции нейронной модели

## 📋 Текущее состояние

✅ **Готовая инфраструктура:**
- Endpoint для генерации вопросов: `POST /api/questions/generate`
- Сохранение в БД с полями для AI ответов
- UI кнопка "Сгенерировать вопросы"
- Система отображения сгенерированных вопросов

⏳ **Требуется реализация:**
- AI сервис для генерации вопросов
- Интеграция с существующим backend

---

## 🎯 Варианты реализации

### Вариант 1: OpenAI API (Быстрый старт) ⚡

**Преимущества:**
- ✅ Быстрая интеграция (1-2 часа)
- ✅ Высокое качество вопросов
- ✅ Не требует обучения модели
- ✅ Хорошая документация

**Недостатки:**
- ❌ Платно (стоимость за токены)
- ❌ Зависимость от внешнего сервиса
- ❌ Требуется интернет

**Стоимость:** ~$0.002 за 1000 токенов (GPT-3.5) или ~$0.03 за 1000 токенов (GPT-4)

**Реализация:**

1. **Установка библиотеки:**
```bash
cd backend
yarn add openai
```

2. **Создание AI сервиса:**
```typescript
// backend/src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateQuestions(chapterContent: string, count: number) {
    const prompt = `
На основе следующего текста из учебной главы, создай ${count} тестовых вопросов с 4 вариантами ответов.

ТЕКСТ ГЛАВЫ:
${chapterContent}

ТРЕБОВАНИЯ:
- Создай вопросы трех уровней сложности: easy, medium, hard
- Каждый вопрос должен иметь 4 варианта ответа
- Укажи правильный ответ
- Добавь краткое объяснение правильного ответа
- Верни результат в формате JSON

ФОРМАТ ОТВЕТА:
{
  "questions": [
    {
      "text": "Текст вопроса?",
      "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
      "correct": "Вариант 1",
      "explanation": "Объяснение почему этот ответ правильный",
      "difficulty": "easy"
    }
  ]
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Ты опытный преподаватель, который создает качественные тестовые вопросы для студентов.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      return parsed.questions;
    } catch (error) {
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}
```

3. **Обновление Questions Service:**
```typescript
// backend/src/questions/questions.service.ts
import { AIService } from '../ai/ai.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    private booksService: BooksService,
    private aiService: AIService, // Inject AI service
  ) {}

  async generateQuestions(
    chapterId: string,
    bookId: string,
    count: number = 5,
  ): Promise<Question[]> {
    const book = await this.booksService.findOne(bookId);
    const chapter = book.chapters.find((ch) => ch.id === chapterId);

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${chapterId} not found`);
    }

    // Используем AI для генерации
    const aiQuestions = await this.aiService.generateQuestions(
      chapter.content,
      count,
    );

    // Сохраняем в БД
    const questions: Question[] = [];
    for (const aiQ of aiQuestions) {
      const question = await this.create({
        bookId: book.id,
        chapterId: chapter.id,
        questionText: aiQ.text,
        options: aiQ.options,
        correctAnswer: aiQ.correct,
        aiAnswer: aiQ.explanation,
        questionLevel: aiQ.difficulty,
        isGenerated: true,
      });
      questions.push(question);
    }

    return questions;
  }
}
```

4. **Добавление в .env:**
```env
OPENAI_API_KEY=sk-your-api-key-here
```

---

### Вариант 2: Локальная модель (LLaMA / Mistral) 🖥️

**Преимущества:**
- ✅ Бесплатно после установки
- ✅ Полный контроль
- ✅ Работает оффлайн
- ✅ Конфиденциальность данных

**Недостатки:**
- ❌ Требует мощное железо (GPU рекомендуется)
- ❌ Сложнее в настройке
- ❌ Может быть медленнее
- ❌ Требует обучения/fine-tuning для лучших результатов

**Требования:**
- Python 3.9+
- 16GB+ RAM
- GPU с 8GB+ VRAM (опционально, но рекомендуется)

**Реализация:**

1. **Создание Python сервиса:**
```bash
mkdir ai-service
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn transformers torch
```

2. **AI сервис на FastAPI:**
```python
# ai-service/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import json

app = FastAPI()

# Загружаем модель (например, Mistral-7B)
model_name = "mistralai/Mistral-7B-Instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)

class GenerateRequest(BaseModel):
    content: str
    count: int = 5

@app.post("/generate-questions")
async def generate_questions(request: GenerateRequest):
    prompt = f"""
На основе следующего текста создай {request.count} тестовых вопросов.

ТЕКСТ:
{request.content}

ФОРМАТ (JSON):
{{
  "questions": [
    {{
      "text": "Вопрос?",
      "options": ["A", "B", "C", "D"],
      "correct": "A",
      "explanation": "Объяснение",
      "difficulty": "easy"
    }}
  ]
}}
"""

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=2000,
        temperature=0.7,
        do_sample=True,
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Парсим JSON из ответа
    try:
        start = response.find('{')
        end = response.rfind('}') + 1
        json_str = response[start:end]
        questions = json.loads(json_str)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

3. **Запуск Python сервиса:**
```bash
python main.py
```

4. **Интеграция с NestJS:**
```typescript
// backend/src/ai/ai.service.ts
import { Injectable, HttpService } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AIService {
  private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  constructor(private httpService: HttpService) {}

  async generateQuestions(content: string, count: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/generate-questions`, {
          content,
          count,
        })
      );
      return response.data.questions;
    } catch (error) {
      throw new Error(`AI service error: ${error.message}`);
    }
  }
}
```

---

### Вариант 3: Fine-tuned модель 🎓

**Для максимального качества:**

1. **Создание датасета:**
   - Соберите 1000+ примеров вопросов
   - Формат: пара (текст главы → вопросы)

2. **Обучение модели:**
   ```python
   from transformers import AutoModelForSeq2SeqLM, Trainer
   
   # Fine-tune T5 или BART модель
   model = AutoModelForSeq2SeqLM.from_pretrained("t5-base")
   
   # Обучение...
   trainer = Trainer(model=model, args=training_args, train_dataset=train_data)
   trainer.train()
   ```

3. **Deployment:**
   - Hugging Face Inference API
   - AWS SageMaker
   - Local server

---

## 📊 Сравнение вариантов

| Критерий | OpenAI | Локальная | Fine-tuned |
|----------|--------|-----------|------------|
| Скорость внедрения | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| Качество | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Стоимость | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Контроль | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Масштабируемость | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🛠️ Рекомендуемый подход

### Этап 1: MVP (1-2 дня)
**Используйте OpenAI API**
- Быстрый старт
- Проверка концепции
- Получение обратной связи

### Этап 2: Оптимизация (1-2 недели)
**Переход на локальную модель**
- Если стоимость OpenAI слишком высока
- Для конфиденциальности данных
- Для оффлайн работы

### Этап 3: Production (1-2 месяца)
**Fine-tune собственную модель**
- На основе собранных данных
- Для максимального качества
- Для специализированных доменов

---

## 📈 Метрики качества

Для оценки качества генерации вопросов:

1. **Автоматические метрики:**
   - Разнообразие вопросов
   - Релевантность тексту
   - Сложность вопросов

2. **Ручная оценка:**
   - Грамматика
   - Логичность
   - Однозначность правильного ответа
   - Качество дистракторов (неправильных вариантов)

3. **Обратная связь от пользователей:**
   - Кнопка "Пожаловаться на вопрос"
   - Статистика: сколько % правильно отвечают
   - Комментарии преподавателей

---

## 🔄 Улучшение качества

### Промпт инжиниринг

Экспериментируйте с промптами:

**Базовый:**
```
Создай вопросы по тексту: {text}
```

**Улучшенный:**
```
Ты опытный педагог. Создай {count} тестовых вопросов для студентов.

ТЕКСТ: {text}

ТРЕБОВАНИЯ:
1. Вопросы должны проверять понимание ключевых концепций
2. Избегай вопросов на запоминание дат/имен
3. Дистракторы должны быть правдоподобными
4. Объяснение должно помочь понять материал

Создай вопросы разной сложности: легкие, средние, сложные.
```

### Постобработка

```typescript
async postProcessQuestions(questions: any[]) {
  return questions.map(q => {
    // Проверка качества
    if (q.text.length < 10) return null;
    if (q.options.length !== 4) return null;
    
    // Нормализация
    q.text = q.text.trim();
    q.options = q.options.map(o => o.trim());
    
    // Валидация
    if (!q.options.includes(q.correct)) {
      q.correct = q.options[0];
    }
    
    return q;
  }).filter(Boolean);
}
```

---

## 🚀 Быстрый старт (OpenAI)

1. **Получите API ключ:**
   - Зарегистрируйтесь на [platform.openai.com](https://platform.openai.com)
   - Создайте API key
   - Пополните баланс ($5 хватит для тестов)

2. **Установите зависимости:**
```bash
cd backend
yarn add openai
```

3. **Создайте AI модуль:**
```bash
nest g module ai
nest g service ai
```

4. **Скопируйте код из "Варианта 1" выше**

5. **Добавьте в .env:**
```env
OPENAI_API_KEY=sk-...
```

6. **Перезапустите backend:**
```bash
yarn start:dev
```

7. **Тестируйте:**
   - Откройте книгу в UI
   - Выберите главу
   - Нажмите "Сгенерировать вопросы"
   - Подождите 10-30 секунд
   - Проверьте результат!

---

## 📚 Дополнительные ресурсы

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Hugging Face Transformers](https://huggingface.co/docs/transformers)
- [LangChain для промпт инжиниринга](https://python.langchain.com/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

## 🎯 Ожидаемый результат

После интеграции AI:

✅ **Автоматическая генерация вопросов:**
- Пользователь выбирает главу
- Нажимает кнопку "Сгенерировать вопросы"
- Система отправляет текст в AI
- AI возвращает качественные вопросы
- Вопросы сохраняются в БД
- Пользователь может сразу пройти тест

✅ **Качество:**
- Вопросы релевантны тексту
- Правильный ответ однозначен
- Неправильные варианты правдоподобны
- Есть объяснение правильного ответа
- Разные уровни сложности

✅ **UX:**
- Быстрая генерация (< 30 сек)
- Прогресс-индикатор
- Уведомление о завершении
- Возможность редактировать вопросы (для админов)

---

**Следующий шаг: Выберите вариант и начните интеграцию! 🚀**

Рекомендую начать с **Варианта 1 (OpenAI)** для быстрого прототипа.



