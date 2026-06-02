export class ApiResponse {
  static success(data, statusCode = 200) {
    return { statusCode, body: { success: true, data } };
  }

  static created(data) {
    return ApiResponse.success(data, 201);
  }

  static noContent() {
    return { statusCode: 204, body: null };
  }

  static error(message, statusCode = 500) {
    return { statusCode, body: { success: false, message } };
  }

  static paginated(data, page, limit, total) {
    return {
      statusCode: 200,
      body: {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  }
}
