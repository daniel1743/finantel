
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-4d4cc3ac92254985b045a1881b85b12a';
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || 'sk-e6343f5b0abc42d294d2ad7f977e48a8';

const SYSTEM_PROMPT = `Eres Finantel AI, un asistente financiero experto, empático y sofisticado. 
Tu tono es profesional pero cercano, similar a un asesor de banca privada moderna.
Responde de manera concisa, usando formato Markdown (negritas, listas) para facilitar la lectura.
Si el usuario pregunta por resumen mensual, gastos o ahorros, ofrece análisis perspicaces.
IMPORTANTE: Si la respuesta requiere mostrar datos visuales, incluye etiquetas especiales como [SHOW_CHART] o [SHOW_SUMMARY_CARD] al final de tu respuesta.`;

export const sendMessageToAI = async (messages) => {
  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ];

  try {
    // Attempt 1: DeepSeek
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: formattedMessages,
        temperature: 0.7,
        stream: false
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
    throw new Error('DeepSeek API failed');

  } catch (error) {
    console.warn('Falling back to Qwen API due to:', error);
    
    // Attempt 2: Qwen (via DashScope compatible mode)
    try {
      const response = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${QWEN_API_KEY}`
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: formattedMessages,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
      throw new Error('All AI services failed');
    } catch (finalError) {
      console.error('AI Service Error:', finalError);
      return "Lo siento, estoy teniendo dificultades para conectar con mis servidores de análisis en este momento. Por favor, intenta de nuevo en unos segundos.";
    }
  }
};
