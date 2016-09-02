export const RequestTypes = {
  // Requesting a single entity from the WP API
  Post: 'Post',
  // Requesting arbitrary data from the WP API
  Query: 'Query'
}

export const Request = {
  // Initiate a request to the WP API
  Create: 'kasia/REQUEST_CREATE',
  // Place a record of a request on the store
  Put: 'kasia/REQUEST_PUT',
  // Place the result of a request on the store
  Complete: 'kasia/REQUEST_COMPLETE',
  // Record the failure of a request on the store
  Fail: 'kasia/REQUEST_FAILED'
}

// Shift a query ID from the prepared query ID array
export const ShiftPreparedQueryId = 'kasia/SHIFT_PREPARED_QUERY_ID'
