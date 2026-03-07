const ws = new WebSocket(`wss://stage3.api.uticlassification.app/ws/16550797-ca86-47b1-8ade-fc65f2891ca9`);

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "prediction" && message.data) {
        console.log("Received cell prediction:", message.data);
    }

    if (message.type === "finished") {
        ws.close();

        setCellInferenceDuration(performance.now() - startTime);

        setCellProcessStatus("finished");
    }
};
