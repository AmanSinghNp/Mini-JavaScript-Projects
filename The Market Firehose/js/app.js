/**
 * Main Application Entry Point
 * Initializes WebSocket connection and render loop
 */

(function() {
    'use strict';

    /**
     * Initialize the application
     */
    function init() {
        console.log('[App] The Market Firehose initializing...');
        
        // Start the render loop (this will update UI at 60fps)
        startRenderLoop();
        
        // Connect to Binance WebSocket
        connect();
        
        console.log('[App] Initialization complete!');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle page visibility (pause when hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('[App] Page hidden - maintaining connection');
        } else {
            console.log('[App] Page visible - ensuring connection');
            if (!isConnected()) {
                connect();
            }
        }
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        disconnect();
    });
})();
