import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../proto/recipeStore';
import path from 'path';
import express, { Request, Response } from 'express';
import { RecipeID } from '../proto/recipeStorePackage/RecipeID';
import { Recipe } from '../proto/recipeStorePackage/Recipe';

const PROTO_PATH: string = "../../../proto/recipeStore.proto";
const PORT: number = 5001;
const portClient = 3000;

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const protoBuf = protoLoader.loadSync(path.resolve(__dirname, PROTO_PATH), options);
const grpcObj = grpc.loadPackageDefinition(protoBuf) as unknown as ProtoGrpcType;

const client = new grpcObj.recipeStorePackage.RecipeStoreService(
  `0.0.0.0:${PORT}`, grpc.credentials.createInsecure()
);

const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);
client.waitForReady(deadline, (err: any) => {
  if (err) {
    console.error(err);
    return;
  }
  onClientReady();
});

const onClientReady = () => {
  console.log(`Server running on port ${PORT} & Client running on port ${portClient}`);
  const app = express();
  app.use(express.json());

  app.get('/recipes', (req: Request, res: Response) => {
    client.GetAllRecipes({}, (err: any, _res: any) => {
      if (err) {
        console.error(err);
        return;
      }
      res.send(_res);
    });
  });

  app.post('/recipes', (req: Request, res: Response) => {
    const createInput: Recipe = req.body;
    const recipe: Recipe = createInput;
    client.AddRecipe(recipe, (err: any, _res: any) => {
      if (err) {
        console.error(err);
        return;
      }
      res.send(_res);
    });
  });

  app.put('/recipes/:id', (req: Request, res: Response) => {
    const recipeID: RecipeID = { id: req.params.id };
    const updatedRecipe: Recipe = req.body;
    const recipeWithID: RecipeWithID = { recipeId: recipeID, recipe: updatedRecipe };
    client.UpdateRecipe(recipeWithID, (err: any, _res: any) => {
      if (err) {
        console.error(err);
        return;
      }
      res.send(_res);
    });
  });

  app.delete('/recipes/:id', (req: Request, res: Response) => {
    const recipeID: RecipeID = { id: req.params.id };
    client.DeleteRecipe(recipeID, (err: any, _res: any) => {
      if (err) {
        console.error(err);
        return;
      }
      res.send(_res);
    });
  });

  app.listen(portClient, () => {
    console.log("Express is started");
  });
};
