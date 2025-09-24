import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiUrl, apiKey, model } = await request.json();
    
    if (!apiUrl || !apiKey || !model) {
      return NextResponse.json({
        success: false,
        error: '缺少必需的参数'
      }, { status: 400 });
    }

    // 测试 API 连接
    const testResponse = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a connection test.'
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      })
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      let errorMessage = `HTTP ${testResponse.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      });
    }

    const data = await testResponse.json();
    
    // 检查响应格式是否符合 OpenAI 标准
    if (!data.choices || !Array.isArray(data.choices)) {
      return NextResponse.json({
        success: false,
        error: 'API 响应格式不符合 OpenAI 标准'
      });
    }

    return NextResponse.json({
      success: true,
      message: '连接测试成功',
      model: data.model || model
    });

  } catch (error) {
    console.error('[test-api-connection] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}