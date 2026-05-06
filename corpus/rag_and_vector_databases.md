# RAG and Vector Databases

## What is RAG?

RAG stands for **Retrieval-Augmented Generation**. It's a pattern for giving an LLM access to specific knowledge without fine-tuning it.

The basic idea: instead of asking an LLM a question and hoping it knows the answer from training, you first **retrieve** relevant documents from your own knowledge base, then **augment** the LLM prompt with that context, then let the LLM **generate** a response grounded in your data.

```
User question
    → embed question → similarity search → retrieve top-k chunks
    → build prompt: [system instructions] + [retrieved context] + [user question]
    → LLM generates response grounded in context
    → return response
```

## Why RAG Instead of Fine-Tuning?

- Fine-tuning is expensive, slow, and requires retraining when data changes
- RAG is dynamic -- update your knowledge base without touching the model
- RAG is explainable -- you can show which documents were retrieved
- RAG works well for domain-specific knowledge the model wasn't trained on

## Embeddings

An embedding is a vector (list of numbers) that represents the semantic meaning of a piece of text. Similar texts have similar vectors.

```python
from openai import OpenAI

client = OpenAI()

def embed(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding
```

The vector for "how do I reverse a list in Python" will be close to "Python list reversal techniques" -- even though the words are different.

## Vector Databases

A vector database stores embeddings and lets you find the most similar ones quickly. This is how you retrieve relevant chunks at query time.

**Chroma** is a popular open-source option:

```python
import chromadb

client = chromadb.Client()
collection = client.get_or_create_collection("curriculum")

# add documents
collection.add(
    documents=["Python lists are ordered, mutable sequences..."],
    embeddings=[[0.1, 0.2, ...]],  # pre-computed
    ids=["chunk_001"]
)

# query
results = collection.query(
    query_embeddings=[embed("how do I sort a list?")],
    n_results=5
)
```

## Chunking

Before embedding, you split your documents into chunks. Chunk size matters:
- **Too large**: chunks contain too much noise, retrieval is imprecise
- **Too small**: chunks lose context, responses are shallow
- **Typical range**: 200-500 tokens per chunk, with some overlap

```python
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks
```

## Retrieval and Ranking

After querying the vector DB, you get back chunks ranked by similarity. You can re-rank them before passing to the LLM:

- **MMR (Maximal Marginal Relevance)**: balances similarity with diversity, avoids redundant chunks
- **Cross-encoder reranking**: run a more expensive model on the top-k to reorder them

For MVP: just use top-k by similarity. Add reranking in Phase 2.

## Building the Prompt

```python
def build_prompt(question: str, chunks: list[str]) -> list[dict]:
    context = "\n\n".join(chunks)
    return [
        {
            "role": "system",
            "content": (
                "You are a Socratic tutor. You must NEVER directly answer the student's question. "
                "Instead, ask guiding questions that help the student discover the answer themselves. "
                "Use the context below to ask informed, specific questions.\n\n"
                f"Context:\n{context}"
            )
        },
        {
            "role": "user",
            "content": question
        }
    ]
```

## The Guardrail Problem

The biggest risk in a Socratic bot: the LLM answers the question anyway. System prompts alone aren't reliable enough.

**Two-layer approach:**
1. System prompt instructs Socratic behavior
2. Post-generation classifier checks the response before it's returned

```python
def is_direct_answer(response: str) -> bool:
    check = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a classifier. Reply with only PASS or FAIL."},
            {"role": "user", "content": (
                f"Does this response directly answer a student's question, "
                f"or does it guide them with questions?\n\nResponse: {response}"
            )}
        ]
    )
    return check.choices[0].message.content.strip() == "FAIL"
```

If it fails, regenerate with a stricter prompt. Log the failure for monitoring.

## Common Mistakes

- Fitting scalers or preprocessing on full dataset before splitting (applies to RAG too -- don't tune retrieval on test queries)
- Chunk size too large → poor retrieval precision
- Not normalizing embeddings before cosine similarity (Chroma handles this)
- Passing too many chunks to the LLM → exceeds context window, degrades response quality
- Relying only on a system prompt for guardrail enforcement
