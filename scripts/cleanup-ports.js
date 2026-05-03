/**
 * Pre-dev cleanup script
 * Kills any zombie processes occupying the dev server ports.
 * Runs automatically before `npm run dev` via the "predev" hook.
 */
const { execSync } = require('child_process');

const DEV_PORTS = [5000, 5173, 5174, 5175, 5176];

DEV_PORTS.forEach((port) => {
  try {
    const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });

    const pids = [
      ...new Set(
        result
          .split('\n')
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid) => pid && /^\d+$/.test(pid) && pid !== '0')
      ),
    ];

    pids.forEach((pid) => {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      } catch (e) {
        // Process may have already exited
      }
    });

    if (pids.length > 0) {
      console.log(`🧹 Freed port ${port} (killed PID: ${pids.join(', ')})`);
    }
  } catch (e) {
    // Port is not in use — nothing to clean
  }
});

console.log('✅ Port cleanup complete');
