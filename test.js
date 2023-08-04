const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  organization: "org-2mIHFM2OxbdSnRNaI8CKeBMz",
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

// const response = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   messages: [],
//   temperature: 0.5,
//   max_tokens: 1024,
// });

const inputText = 'write 5 types of niche'


openai
  .createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Hello" }],
    prompt: inputText
  })
  .then((res) => {
    console.log(res.data.choices[0].message.content);
  })
  .catch((e) => {
    console.log(e);
  });



// const generateText = async () => {
//     try {
//       const response = await openai.createCompletion({
//         engine: 'text-davinci-002', // Adjust the engine based on your needs
//         prompt: inputText,
//         maxTokens: 150,
//       });
//       setOutputText(response.data.choices[0].text);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   generateText();