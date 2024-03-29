import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import GameTitle from "../models/GameTitle.js"
import "../config/connection.js";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  const query: string = req.query.q as string;
  const limit: number = parseInt(req.query.limit as string) || 10;
  const offset: number = (parseInt(req.query.page as string) - 1) * limit || 0;
  if (!query) {
    return context.res.status(400).json({ message: "Search query is missing" });
  }
  const cleanQuery = query
    .replace(/[^\w\s]/gi, "") // remove non-word and non-space characters
    .replace(/\s+/g, "\\s+") // replace spaces with \s+ for fuzzy search
    .replace(/[eéèêë]/gi, "[eéèêë]") // include variations of "e" with diacritical marks
    .replace(/[aàáâãäå]/gi, "[aàáâãäå]") // include variations of "a" with diacritical marks
    .replace(/[iíìîï]/gi, "[iíìîï]") // include variations of "i" with diacritical marks
    .replace(/[oóòôõö]/gi, "[oóòôõö]") // include variations of "o" with diacritical marks
    .replace(/[uúùûü]/gi, "[uúùûü]") // include variations of "u" with diacritical marks
    .replace(/[cç]/gi, "[cç]"); // include variations of "c" with diacritical marks

  const regex = new RegExp(cleanQuery, "i");

  try {
    const results = await GameTitle.find({ title: regex })
      .limit(limit)
      .skip(offset);

    if (results.length === 0) {
      return context.res.status(204).send();
    }

    return context.res.status(200).json(results);
  } catch (error) {
    console.error(error);
    context.res
      .status(500)
      .json({ message: "An error occurred while searching for game titles" });
  }
};

export default httpTrigger;
