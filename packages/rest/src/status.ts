import type { StatusCode } from 'h3'

/**
 * Descriptive HTTP status codes, for code readability.
 *
 * See RFC 2616 - https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 * And RFC 6585 - https://tools.ietf.org/html/rfc6585
 * And RFC 4918 - https://tools.ietf.org/html/rfc4918
 */

/// to-arrow
export function isInformational(code: StatusCode): boolean {
  return code >= 100 && code <= 199
}

/// to-arrow
export function isSuccess(code: StatusCode): boolean {
  return code >= 200 && code <= 299
}

/// to-arrow
export function isRedirect(code: StatusCode): boolean {
  return code >= 300 && code <= 399
}

/// to-arrow
export function isClientError(code: StatusCode): boolean {
  return code >= 400 && code <= 499
}

/// to-arrow
export function isServerError(code: StatusCode): boolean {
  return code >= 500 && code <= 599
}

export const HTTP_100_CONTINUE: StatusCode = 100
export const HTTP_101_SWITCHING_PROTOCOLS: StatusCode = 101
export const HTTP_102_PROCESSING: StatusCode = 102
export const HTTP_103_EARLY_HINTS: StatusCode = 103
export const HTTP_200_OK: StatusCode = 200
export const HTTP_201_CREATED: StatusCode = 201
export const HTTP_202_ACCEPTED: StatusCode = 202
export const HTTP_203_NON_AUTHORITATIVE_INFORMATION: StatusCode = 203
export const HTTP_204_NO_CONTENT: StatusCode = 204
export const HTTP_205_RESET_CONTENT: StatusCode = 205
export const HTTP_206_PARTIAL_CONTENT: StatusCode = 206
export const HTTP_207_MULTI_STATUS: StatusCode = 207
export const HTTP_208_ALREADY_REPORTED: StatusCode = 208
export const HTTP_226_IM_USED: StatusCode = 226
export const HTTP_300_MULTIPLE_CHOICES: StatusCode = 300
export const HTTP_301_MOVED_PERMANENTLY: StatusCode = 301
export const HTTP_302_FOUND: StatusCode = 302
export const HTTP_303_SEE_OTHER: StatusCode = 303
export const HTTP_304_NOT_MODIFIED: StatusCode = 304
export const HTTP_305_USE_PROXY: StatusCode = 305
export const HTTP_306_RESERVED: StatusCode = 306
export const HTTP_307_TEMPORARY_REDIRECT: StatusCode = 307
export const HTTP_308_PERMANENT_REDIRECT: StatusCode = 308
export const HTTP_400_BAD_REQUEST: StatusCode = 400
export const HTTP_401_UNAUTHORIZED: StatusCode = 401
export const HTTP_402_PAYMENT_REQUIRED: StatusCode = 402
export const HTTP_403_FORBIDDEN: StatusCode = 403
export const HTTP_404_NOT_FOUND: StatusCode = 404
export const HTTP_405_METHOD_NOT_ALLOWED: StatusCode = 405
export const HTTP_406_NOT_ACCEPTABLE: StatusCode = 406
export const HTTP_407_PROXY_AUTHENTICATION_REQUIRED: StatusCode = 407
export const HTTP_408_REQUEST_TIMEOUT: StatusCode = 408
export const HTTP_409_CONFLICT: StatusCode = 409
export const HTTP_410_GONE: StatusCode = 410
export const HTTP_411_LENGTH_REQUIRED: StatusCode = 411
export const HTTP_412_PRECONDITION_FAILED: StatusCode = 412
export const HTTP_413_REQUEST_ENTITY_TOO_LARGE: StatusCode = 413
export const HTTP_414_REQUEST_URI_TOO_LONG: StatusCode = 414
export const HTTP_415_UNSUPPORTED_MEDIA_TYPE: StatusCode = 415
export const HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE: StatusCode = 416
export const HTTP_417_EXPECTATION_FAILED: StatusCode = 417
export const HTTP_418_IM_A_TEAPOT: StatusCode = 418
export const HTTP_421_MISDIRECTED_REQUEST: StatusCode = 421
export const HTTP_422_UNPROCESSABLE_ENTITY: StatusCode = 422
export const HTTP_423_LOCKED: StatusCode = 423
export const HTTP_424_FAILED_DEPENDENCY: StatusCode = 424
export const HTTP_425_TOO_EARLY: StatusCode = 425
export const HTTP_426_UPGRADE_REQUIRED: StatusCode = 426
export const HTTP_428_PRECONDITION_REQUIRED: StatusCode = 428
export const HTTP_429_TOO_MANY_REQUESTS: StatusCode = 429
export const HTTP_431_REQUEST_HEADER_FIELDS_TOO_LARGE: StatusCode = 431
export const HTTP_451_UNAVAILABLE_FOR_LEGAL_REASONS: StatusCode = 451
export const HTTP_500_INTERNAL_SERVER_ERROR: StatusCode = 500
export const HTTP_501_NOT_IMPLEMENTED: StatusCode = 501
export const HTTP_502_BAD_GATEWAY: StatusCode = 502
export const HTTP_503_SERVICE_UNAVAILABLE: StatusCode = 503
export const HTTP_504_GATEWAY_TIMEOUT: StatusCode = 504
export const HTTP_505_HTTP_VERSION_NOT_SUPPORTED: StatusCode = 505
export const HTTP_506_VARIANT_ALSO_NEGOTIATES: StatusCode = 506
export const HTTP_507_INSUFFICIENT_STORAGE: StatusCode = 507
export const HTTP_508_LOOP_DETECTED: StatusCode = 508
export const HTTP_509_BANDWIDTH_LIMIT_EXCEEDED: StatusCode = 509
export const HTTP_510_NOT_EXTENDED: StatusCode = 510
export const HTTP_511_NETWORK_AUTHENTICATION_REQUIRED: StatusCode = 511
