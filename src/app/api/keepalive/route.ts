/* eslint-disable no-console */
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 预热搜索API的简单查询
const WARMUP_QUERIES = ['clannad'];

export async function GET() {
  try {
    console.log('Keepalive triggered:', new Date().toISOString());
    
    // 默认启用搜索API预热
    await warmupSearchApis();
    
    return NextResponse.json({
      success: true,
      message: 'Keepalive executed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Keepalive failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Keepalive failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 预热搜索API函数
async function warmupSearchApis() {
  try {
    console.log('Starting search API warmup');
    
    // 对每个预热查询发起简单请求
    for (const query of WARMUP_QUERIES) {
      try {
        const warmupUrl = `/api/search?q=${encodeURIComponent(query)}&stream=0&timeout=5`;
        console.log(`Warming up with query: ${query}`);
        
        // 使用较短的超时时间，避免影响正常服务
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(warmupUrl, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`Warmup successful for query: ${query}`);
        } else {
          console.warn(`Warmup failed for query: ${query}, status: ${response.status}`);
        }
        
        // 短暂延迟，避免对API造成过大压力
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`Warmup error for query ${query}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    console.log('Search API warmup completed');
  } catch (error) {
    console.error('Search API warmup failed:', error);
  }
}