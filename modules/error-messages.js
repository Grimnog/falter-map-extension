/**
 * Error Messages - Centralized user-friendly error message templates
 * All error messages should be actionable and avoid technical jargon
 */

export const ERROR_MESSAGES = {
    // Network errors
    networkError: 'Unable to connect to the geocoding service. Please check your internet connection and try again.',

    // API rate limiting
    rateLimitError: 'Geocoding service rate limit reached. Waiting {seconds} seconds before continuing...',

    // Geocoding errors
    geocodingPartialFailure: '{failedCount} of {totalCount} addresses could not be located. This is normal for unusual address formats.',

    geocodingCompleteFailure: 'Unable to locate any restaurant addresses. Please check your internet connection or try again later.',

    geocodingSingleFailure: 'Could not locate address for this restaurant. The address may be invalid or not recognized.',

    // Map errors
    mapInitError: 'Map failed to load. Please refresh the page and try again.',

    // Parsing errors
    parsingError: 'Unable to load restaurant data from the page. The page structure may have changed.',

    pageLoadError: 'Unable to load additional restaurant pages. Please try again.',

    // Empty results
    noRestaurantsFound: 'No restaurants found matching your filters. Try adjusting your search criteria.',

    // Generic fallback
    genericError: 'An unexpected error occurred. Please try refreshing the page.'
};
