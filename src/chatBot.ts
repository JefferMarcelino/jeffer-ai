import axios from "axios"
import { removeEmojis } from "@nlpjs/emoji"
import { dockStart } from "@nlpjs/basic"
import { Normalizer } from "@nlpjs/core"

const corpusPt = require("./corpus-pt.json")

const normalizer = new Normalizer()

let manager:any;

function toTitleCase(str:string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

async function train(nlp:any) {
  const dock = await dockStart({ use: ["Basic", "LangPt"] });
  nlp = dock.get('nlp');
 
  await nlp.addCorpus(corpusPt);
  nlp.addLanguage("pt");

  await nlp.train();

  return nlp;
}

async function compute(nlp:any, msg:string) {
  msg = normalizer.normalize(msg);

  const reply = await nlp.process(removeEmojis(msg));

  return reply
}

// The input given to the bot
const chatBot = async (name:string, input:string) => {  
  const nlp = await train(manager)

  try {
    const answer = await compute(nlp, input)

    switch(answer.intent) {
      case "usuario.precisadeconselhos": {
        const res = await axios.get("https://api.adviceslip.com/advice")
        try {
          return {
            intent: answer.intent,
            answer: res.data.slip.advice,
            language: "en",
            image: ""
          }
        } catch {
          return false
        }
      } 
      
      case "piada": {
        const res = await axios.get("https://v2.jokeapi.dev/joke/Any")
        try {
          if (res.data.type == "single") {
            return {
              intent: answer.intent,
              answer: `*Category:* ${res.data.category}\n\n${res.data.joke}`,
              language: "en",
              image: ""
            }
          } else {
            return {
              intent: answer.intent,
              answer: `*Category:* ${res.data.category}\n\n${res.data.setup}\n${res.data.delivery}`,
              language: "en",
              image: ""
            }
          }
        } catch {
          return false
        }
      } 
      
      case "usuario.informacao": {
        try {
          return {
            intent: answer.intent,
            answer: `${answer.answer.replace(/{{name}}/gi, name)}`,
            language: "pt",
            image: ""
          }
        } catch {
          return false
        }
      } 
      
      case "usuario.tedio": {
        const res = await axios.get("https://www.boredapi.com/api/activity")
        try {
          return {
            intent: answer.intent,
            answer: `*Type:* ${toTitleCase(res.data.type)}\n*Participants:* ${res.data.participants}\n*Activity:* ${res.data.activity}`,
            language: "en",
            image: ""
          }
        } catch {
          return false
        }
      } 
      
      case "citacoes": {
        const res = await axios.get("https://api.fisenko.net/v1/quotes/en/random")
        try {
          return {
            intent: answer.intent,
            answer: `${res.data.text} - _${res.data.author.name}_`,
            language: "en",
            image: ""
          }
        } catch  {
          return false
        }
      } 
      
      case "citacoes.programacao": {
        const res = await axios.get("https://programming-quotes-api.herokuapp.com/quotes/random")
        try {
          return {
            intent: answer.intent,
            answer: `${res.data.en} - _${res.data.author}_`,
            language: "en",
            image: ""
          }
        } catch {
          return false
        }
      } 
      
      case "usuario.fome": {
        const res = await axios.get("https://foodish-api.herokuapp.com/api/")
        console.log(res)
        try {
          return {
            intent: answer.intent,
            answer: answer.answer,
            language: "pt",
            image: res.data.image
          }
        } catch(err) {
          return false
        }
      } 

      default: {
        try {
          return {
            intent: answer.intent,
            answer: answer.answer,
            language: "pt",
            image: ""
          }
        } catch {
          return false
        }
      }
    }
  } catch {
    return false
  }
}

export default chatBot
