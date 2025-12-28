export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.path,
    method: req.method
  });

  // 데이터베이스 에러 처리
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: '중복된 데이터입니다.',
        details: err.detail
      }
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: '관련된 데이터가 존재합니다.',
        details: err.detail
      }
    });
  }

  if (err.code === '23514') { // Check constraint violation
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '데이터 제약 조건을 위반했습니다.',
        details: err.detail
      }
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: '데이터베이스 연결에 실패했습니다.'
      }
    });
  }

  // 기본 에러 처리
  const status = err.status || err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};



