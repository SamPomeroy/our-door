from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

CORPUS_PATH = "./corpus"
CHROMA_COLLECTION = "curriculum"


def load_files(path: str) -> tuple[list[str], list[str]]:
    # TODO: add pypdf for PDFs (pip install pypdf)
    texts = []
    filenames = []
    for f in Path(path).rglob("*"):
        if f.suffix == ".md":
            texts.append(f.read_text())
            filenames.append(f.name)
        elif f.suffix == ".pdf":
            # TODO: from pypdf import PdfReader; extract page text
            pass
    return texts, filenames


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


def load_to_chroma(chunks: list[str], embeddings: list[list[float]], metadatas: list[dict]) -> None:
    import chromadb
    client = chromadb.HttpClient(host="localhost", port=8001)
    collection = client.get_or_create_collection(CHROMA_COLLECTION)
    ids = [f"chunk-{i}" for i in range(len(chunks))]
    collection.upsert(ids=ids, documents=chunks, embeddings=embeddings, metadatas=metadatas)


def main():
    texts, filenames = load_files(CORPUS_PATH)
    all_chunks = []
    all_meta = []
    for text, filename in zip(texts, filenames):
        chunks = chunk_text(text)
        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            all_meta.append({"source": filename, "chunk_index": i})
    embeddings = embed_chunks(all_chunks)
    load_to_chroma(all_chunks, embeddings, all_meta)
    print(f"loaded {len(all_chunks)} chunks into chroma")


if __name__ == "__main__":
    main()
