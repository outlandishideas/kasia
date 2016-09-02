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

// Subtract from the number of remaining prepared queries
export const SubtractPreparedQueries = 'kasia/SUBTRACT_PREPARED_QUERIES'
