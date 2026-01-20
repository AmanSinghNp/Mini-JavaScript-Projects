import { describe, it, expect } from 'vitest';
import { Network } from '../src/core/Network.js';
import { TrainerController } from '../src/ui/TrainerController.js';

describe('TrainerController Integration', () => {
    it('should reduce loss on XOR problem over time', () => {
        // Mock renderer
        const mockRenderer = {
            updateVisuals: () => {}
        };

        const network = new Network({
            topology: [2, 2, 1],
            learningRate: 0.5
        });

        const trainer = new TrainerController(network, mockRenderer, {
            stepsPerFrame: 10,
            learningRate: 0.5
        });
        
        // Mock requestAnimationFrame to just return a dummy ID
        global.requestAnimationFrame = (cb) => {
            return 123;
        };

        trainer.isRunning = true;
        
        let initialLoss = 1.0;
        
        // Train for a bit
        for(let i=0; i<100; i++) {
            trainer.loop();
            // In the real loop, it schedules next. We just call it manually.
            
            if (i === 0) initialLoss = trainer.lossStats.avg;
        }

        const finalLoss = trainer.lossStats.avg;
        
        console.log(`Initial Loss: ${initialLoss}, Final Loss: ${finalLoss}`);
        
        expect(finalLoss).toBeLessThan(initialLoss);
        expect(finalLoss).toBeLessThan(0.2); 
    });
});
