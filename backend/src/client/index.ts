import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { RecipeServiceClient } from './generated/recipe_grpc_pb';
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

const client = new RecipeServiceClient(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Add a new recipe
const newRecipe = new Recipe();
newRecipe.setName('Nasi Goreng');
newRecipe.setDescription('Nasi goreng enak');
newRecipe.setIngredients('Nasi, Telur, Kecap, Bawang');
newRecipe.setSteps('1. Tumis bawang. 2. Masukkan telur. 3. Tambahkan nasi dan kecap.');

const addRequest = new AddRecipeRequest();
addRequest.setRecipe(newRecipe);

client.addRecipe(addRequest, (err, response) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`Added Recipe: ${response.getName()}`);
});

// Search for recipes
const searchRequest = new SearchRequest();
searchRequest.setKeyword('Goreng');

const call = client.searchRecipe(searchRequest);
call.on('data', (recipe: Recipe) => {
  console.log(`Found Recipe: ${recipe.getName()} - ${recipe.getDescription()}`);
});
call.on('end', () => {
  console.log('Search completed.');
});
