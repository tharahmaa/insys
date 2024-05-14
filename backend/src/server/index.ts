import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { RecipeServiceHandlers } from './generated/recipe_grpc_pb';
import { Recipe, SearchRequest, AddRecipeRequest } from './generated/recipe_pb';

const PROTO_PATH = __dirname + '/../proto/recipe.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const recipeService = protoDescriptor.RecipeService;

const recipes: Recipe[] = [];

const server: grpc.Server = new grpc.Server();

const recipeServiceHandlers: RecipeServiceHandlers = {
  SearchRecipe: (call) => {
    const keyword = call.request.getKeyword().toLowerCase();
    const result = recipes.filter(recipe =>
      recipe.getName().toLowerCase().includes(keyword) ||
      recipe.getDescription().toLowerCase().includes(keyword) ||
      recipe.getIngredients().toLowerCase().includes(keyword) ||
      recipe.getSteps().toLowerCase().includes(keyword)
    );
    result.forEach(recipe => call.write(recipe));
    call.end();
  },
  AddRecipe: (call, callback) => {
    const newRecipe = call.request.getRecipe();
    recipes.push(newRecipe);
    callback(null, newRecipe);
  },
};

server.addService(recipeService.service, recipeServiceHandlers);

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
  console.log('Server running at http://0.0.0.0:50051');
});
