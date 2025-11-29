export default {
    async scheduled(event, env, ctx) {
        console.log("Cron triggered");
        const resp = await fetch('https://easymoney-demo.pages.dev/api/reset', {
            headers: {
                'Authorization': `Bearer ${env.CRON_SECRET}`
            }
        });
        console.log("Reset response status:", resp.status);
    },
};
