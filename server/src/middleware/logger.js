/**
 * 요청 로깅 미들웨어
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      console.error(`❌ ${logMessage}`);
    } else {
      console.log(`✅ ${logMessage}`);
    }
  });
  
  next();
};

