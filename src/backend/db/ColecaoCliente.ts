import db from '../config';
import Cliente from "../../core/Cliente";
import ClienteRepositorio from "../../core/ClienteRepositorio";
import firestore, { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';


export default class ColecaoCliente implements ClienteRepositorio {

    #conversor = {
        toFirestore(cliente: Cliente){
            return {
                nome: cliente.nome,
                idade: cliente.idade,
            }
        },
        fromFirestore(snapshot: firestore.QueryDocumentSnapshot, options: firestore.SnapshotOptions): Cliente {
            const dados = snapshot.data(options)
            return new Cliente(dados.nome, dados.idade, snapshot.id)
        }
    }

    async salvar(cliente: Cliente): Promise<Cliente> {

        if (cliente?.id) {
            await setDoc(doc(db, 'clientes', cliente.id).withConverter(this.#conversor), cliente)
            return cliente
        } else {
            const docRef = await addDoc(collection(db, 'clientes').withConverter(this.#conversor), cliente) 
            const doc = await getDoc(docRef) 
            return doc.data()
        }

    }

    async excluir(cliente: Cliente): Promise<void> {
        return await deleteDoc(doc(db, 'clientes', cliente.id))
    }

    async obterTodos(): Promise<Cliente[]> {
        const query = await this.colecao()
        return query.docs.map(doc => doc.data()) ?? []
    }

    private colecao() {
        const colecaoCliente = collection(db, 'clientes').withConverter(this.#conversor) 
        return getDocs(colecaoCliente)
    }
    
}