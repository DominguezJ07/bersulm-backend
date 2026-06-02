import { ApiResponse } from '../../src/shared/domain/ApiResponse.js';

describe('ApiResponse', () => {
  it('should return success response', () => {
    const { statusCode, body } = ApiResponse.success({ id: 1 });
    expect(statusCode).toBe(200);
    expect(body).toEqual({ success: true, data: { id: 1 } });
  });

  it('should return created response', () => {
    const { statusCode, body } = ApiResponse.created({ id: 1 });
    expect(statusCode).toBe(201);
    expect(body).toEqual({ success: true, data: { id: 1 } });
  });

  it('should return noContent response', () => {
    const { statusCode, body } = ApiResponse.noContent();
    expect(statusCode).toBe(204);
    expect(body).toBeNull();
  });

  it('should return error response', () => {
    const { statusCode, body } = ApiResponse.error('Not found', 404);
    expect(statusCode).toBe(404);
    expect(body).toEqual({ success: false, message: 'Not found' });
  });

  it('should return paginated response', () => {
    const { statusCode, body } = ApiResponse.paginated([1, 2], 1, 10, 25);
    expect(statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([1, 2]);
    expect(body.pagination).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });
  });
});
