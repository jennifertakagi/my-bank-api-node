import express from 'express';
import accountRouter from './routes/accountRouter.js';

const app = express();

app.use(express.json());
app.use('/accounts', accountRouter);

app.listen(3031, async () => {
    // try {
    //     await fs.readFile(fileName);

    //     logger.info('API started');
    // } catch(error) {
    //     const initialJSON = {
    //         nextId: 1,
    //         grades: []
    //     };
    //     fs.writeFile(fileName, JSON.stringify(initialJSON))
    //         .then(() => {
    //             logger.info('API started and file created!');
    //         })
    //         .catch((error) => {
    //             logger.error(error);
    //         });
    // }
});
