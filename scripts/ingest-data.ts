// import "pdf-parse";
import "dotenv/config";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { pinecone } from '@/utils/pinecone-client';


/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/

console.log("Pinecone Index Name:", PINECONE_INDEX_NAME);

const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
    });

    console.log('loading raw docs...', directoryLoader);

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();
    console.log('rawDocs:', rawDocs);

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    const validDocs = docs.filter(doc => doc.pageContent && doc.pageContent.length > 0);
    console.log('validDocs:', validDocs);

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();

// import "pdf-parse";
// import "dotenv/config";
// import { PineconeStore } from "@langchain/pinecone";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { Pinecone } from "@pinecone-database/pinecone";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { DirectoryLoader } from "langchain/document_loaders/fs/directory";

// const run = async () => {
//   const directoryLoader = new DirectoryLoader("docs", {
//     ".pdf": (path) => new PDFLoader(path),
//   });

//   const rawDocs = await directoryLoader.load();

//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });

//   const docs = await textSplitter.splitDocuments(rawDocs);

//   const pinecone = new Pinecone();
//   const pineconeIndex = pinecone.Index("demo");

//   const embeddings = new OpenAIEmbeddings({
//     model: "text-embedding-3-small",
//   });

//   await PineconeStore.fromDocuments(docs, embeddings, {
//     namespace: "test-resume",
//     pineconeIndex: pineconeIndex,
//   });
// };

// (async () => {
//   await run();
//   console.log("ingestion complete");
// })();

