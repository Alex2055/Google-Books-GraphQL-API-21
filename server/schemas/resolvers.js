const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const resolvers = {

Query: {
    me: async (parent, args, context) => {
       
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          
        return userData;
      }

      throw new AuthenticationError('Not logged in');
    }
},
Mutation: {
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        
        if (!user) {
          throw new AuthenticationError('Incorrect credentials');
        }
        
        const correctPw = await user.isCorrectPassword(password);
        
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials pass');
        }
      
        const token = signToken(user);
        return { token, user };
      },
    addUser: async (parent, args, context) => {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
    },
    saveBook: async (parent, args, context) => {
        console.log(args)
        if (context.user) {
            const updateduser = await User.findByIdAndUpdate(
            {_id: context.user._id},
            { $addToSet: { savedBooks: args} },
            { new: true})

            return updateduser;
    }
    
},
removeBook: async (parent, params, context) => {
    if (context.user) {
        console.log(params.bookId)
        const deletedbookuser = await User.findByIdAndUpdate(
            {_id: context.user._id},
            { $pull: { savedBooks: {bookId: params.bookId}} },
            { new: true}
        )
        return deletedbookuser;
    }
}
    
}
}


module.exports = resolvers;