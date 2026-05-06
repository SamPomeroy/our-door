from pathlib import Path

CORPUS_PATH = "./corpus"
CHROMA_COLLECTION = "curriculum"


def load_files(path: str) -> list[str]:
    # TODO: add pypdf for PDFs (pip install pypdf)
    texts = []
    for f in Path(path).rglob("*"):
        if f.suffix == ".md":
            texts.append(f.read_text())
        elif f.suffix == ".pdf":
            # TODO: from pypdf import PdfReader; extract page text
            pass
    return texts


def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) > chunk_size and current:
            chunks.append(current.strip())
            current = p
        else:
            current += "\n\n" + p
    if current:
        chunks.append(current.strip())
    return chunks


def embed_chunks(chunks: list[str]) -> list[list[float]]:
    # TODO: batch requests to stay under openai rate limits
    import openai
    client = openai.OpenAI()
    embeddings = []
    for chunk in chunks:
        resp = client.embeddings.create(model="text-embedding-3-small", input=chunk)
        embeddings.append(resp.data[0].embedding)
    return embeddings


def load_to_chroma(chunks: list[str], embeddings: list[list[float]]) -> None:
    import chromadb
    client = chromadb.HttpClient(host="localhost", port=8001)
    collection = client.get_or_create_collection(CHROMA_COLLECTION)
    ids = [f"chunk-{i}" for i in range(len(chunks))]
    collection.upsert(ids=ids, documents=chunks, embeddings=embeddings)


def main():
    texts = load_files(CORPUS_PATH)
    all_chunks = []
    for text in texts:
        all_chunks.extend(chunk_text(text))
    embeddings = embed_chunks(all_chunks)
    load_to_chroma(all_chunks, embeddings)
    print(f"loaded {len(all_chunks)} chunks into chroma")


if __name__ == "__main__":
    main()
