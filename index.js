import { gql, ApolloServer, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";
import axios from 'axios';

const persons = [
  {
    name: "Juan",
    age: "23",
    phone: "057-3214568956",
    street: "Avenida fullstack",
    city: "Bogotá",
    id: "3d4521487-33d9-52145b215544",
  },
  {
    name: "Pedro",
    age: "18",
    street: "Avenida backend",
    city: "Medellín",
    id: "3d4521587-33d9-52145b2185621",
  },
  {
    name: "Pablo",
    age: "23",
    phone: "057-3215545623",
    street: "Avenida desing",
    city: "Cali",
    id: "3d4521487-33d9-5214523xxf15544",
  },
  {
    name: "Mateo",
    age: "23",
    phone: "057-3234568956",
    street: "Avenida dataScience",
    city: "Barranquila",
    id: "3d4521487-334dk-52145b215544",
  },
];

//schema:
const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    id: ID!
    name: String!
    phone: String
    address: Address!
    age: Int!
    check: String!
    canDrink: Boolean!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(
      name: String!
      phone: String!
    ): Person
  }
`;

//Resolvers:
const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: async(root, args) => {
      const {data: personsFromRestApi } = await axios.get('http://localhost:3000/persons');
      // console.log(personsFromRestApi);
      // if(!args.phone) return persons;
      if(!args.phone) return personsFromRestApi;
      // return persons  
      //   .filter(person => args.phone === 'YES' ? person.phone : !person.phone);
      const byPhone = person => args.phone === 'YES' ? person.phone : !person.phone;
      return personsFromRestApi.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },
  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        // throw new Error("Name must be unique.");
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });
      }
      // const {name, phone,street,city} = args;
      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex(p => p.name === args.name);
      if(personIndex === -1) return null;

      const person = persons[personIndex];

      const updatePerson = {...person, phone: args.phone };
      persons[personIndex] = updatePerson;
      return updatePerson;
    }
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
    canDrink: (root) => root.age > 18,
    check: () => "graphQL2022",
  },
};

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url} port!`);
});

//En resolver
// Person: {
//   name: (root) => root.name,
//   phone: (root) => root.phone,
//   street: (root) => root.street,
//   city: (root) => root.city,
//   id: (root) => root.id,
// } esto lo hace por defecto grahpQl pero puede servir para agregar nuevos campos:
