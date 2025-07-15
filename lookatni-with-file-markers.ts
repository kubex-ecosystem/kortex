package main

import (
	"fmt"
	"log"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Webhook recebido!")
	r.ParseForm()
	fmt.Println("Headers:", r.Header)
	fmt.Println("Body:")
	r.WriteHeader(http.StatusOK)
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Webhook listener rodando na porta 3000...")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
