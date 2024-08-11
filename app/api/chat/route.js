import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `Welcome to PC Build Support!

Hello! I'm here to help you build your perfect PC. Whether you're upgrading an existing setup or starting from scratch, I can assist you in selecting compatible components, finding the best deals, and answering any questions you might have about your build.

Here’s how I can help:

    Component Recommendations: Get personalized suggestions for CPUs, GPUs, motherboards, RAM, storage, and more.
    Compatibility Checks: Verify that your chosen parts will work together seamlessly.
    Budgeting: Find options that fit your budget and maximize your performance.
    Troubleshooting: Address any issues or concerns you have during the selection process.

Feel free to ask me anything related to PC building. Let’s get started on your dream build!

Examples of things you might ask:

    "What CPU is compatible with the GTX 4080?"
    "Can you recommend a budget-friendly motherboard for gaming?"
    "How do I ensure my power supply is sufficient for my build?"

Please note: For the best results, provide as much detail as possible about your needs and preferences.
`

export async function POST(req) {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
  })
  const data = await req.json()

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...data,
    ],
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content
          if (content) {
            const text = encoder.encode(content)
            controller.enqueue(text)
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new NextResponse(stream)
}
