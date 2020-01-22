---
title: "Generators in TypeScript"
date: 2019-08-05
layout: post
tags: typescript
description:
thumbnail: /assets/images/typescript-logo.svg
---

I was working on a problem last week that required a doubly-linked list in TypeScript. I also got to work with [generators](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html) for the first time.

Let's begin by creating our `NodeDef` object. This is the object that represents the nodes of our linked list. You'll notice that it has both `append` and `prepend` functions, depending on where we are adding to our linked list.

```ts
class NodeDef {
    index: number;
    nextNode: NodeDef | undefined = undefined;
    previousNode: NodeDef | undefined = undefined;

    constructor(index: number) {
        this.index = index;
    }

    append(node: NodeDef): void {
        if (this.nextNode) {
            let nextNode = this.nextNode;
            node.nextNode = nextNode;
            nextNode.previousNode = node;
        }
        this.nextNode = node;
        node.previousNode = this;
    }

    prepend(node: NodeDef): void {
        if (this.previousNode) {
            let previousNode = this.previousNode;
            node.previousNode = previousNode;
            previousNode.nextNode = node;
        }
        this.previousNode = node;
        node.nextNode = this;
    }

    toString(): string {
        return `${this.index}`;
    }
}
```

Now, let's create a class that holds a generator. It will return an iterable of `NodeDef` instances. We also need to be able to insert the node in its correct place. Specifically, the `NodeDef` will be inserted in `index` order.

```ts
class MyGenerator {
    firstNode: NodeDef | undefined = undefined;
    key: string;

    get path(): NodeDef[] {
        let arr: NodeDef[] = [];
        for (let nextNode of this.getNextNode()) {
            if (nextNode) {
                arr.push(nextNode);
            }
        }
        return arr;
    }

    constructor(key: string) {
        this.key = key;
    }

    addNode(newNode: NodeDef): void {
        let done: boolean = false;

        // If the first node is not defined, then this node
        // is the first to be added to the subject.
        if (this.firstNode === undefined) {
            this.firstNode = newNode;
            done = true;
        }
        // If this new node has a lower index than the first node,
        // then this node is the new first node.
        else if (newNode.index < this.firstNode.index) {
            this.firstNode.prepend(newNode);
            this.firstNode = newNode;
            done = true;
        }

        let currentNode: NodeDef = this.firstNode;
        while (!done) {
            // If the new node has a lower index than the current node,
            // then this node should be prepended to the current node.
            if (newNode.index < currentNode.index) {
                currentNode.prepend(newNode);
                done = true;
            }
            // If the current node does not have a next node,
            // then append the new node to the current node.
            else if (currentNode.nextNode === undefined) {
                currentNode.append(newNode);
                done = true;
            }
            // Otherwise, advance to the next node.
            else {
                currentNode = currentNode.nextNode;
                done = false;
            }
        }
    }

    /**
     * Generator function, returning NodeDef instances as long as
     * there is still a next NodeDef in the linked list.
     */
    *getNextNode(): Iterable<NodeDef | undefined> {
        let nextNode = this.firstNode;
        while (nextNode !== undefined) {
            yield nextNode;
            nextNode = nextNode.nextNode;
        }
    }

    toString(): string {
        return `Subject ${this.key}: ${this.path.join(", ")}`;
    }
}
```

Finally, let's create a generator and check out the output.

```ts
let generator = new MyGenerator("ABC");
for (let i = 0; i < 10; i++) {
    let rand = Math.floor(Math.random() * 1e6);
    let node = new NodeDef(rand);
    generator.addNode(node);
}

console.log(generator.toString());
```

The console output will look like the following.

```
Subject ABC: 49454, 122178, 186983, 307018, 456169, 558372, 632665, 838801, 847234, 914944
```

You can find this code in the [TypeScript Playground](https://www.typescriptlang.org/play/index.html#code/MYGwhgzhAEByD2ATApgEWQM2gbwLAChpoBLAOxQA8AuaUgVwFsAjZAJwG4CjTkKAXBChqC0maAB9odcpjLJE0ALxSZGOYk6FoAB1bIAbsXh0II4UlFZJ0lGp4LlN2fc1doweKQh9WdYH3hWAAoyShp6ZjYAShw3Ij4AC2IIADpQ3iUSGQpNIgBfAjcwbW1kciDSC3MUdAwomn14YgU8LSJiLCDE5JSefhEY1qJh6BBkPlpeAQtM7tS+6ZRckdoLXqmRTIWRZZHttd0DIxNN5UqluOgCtug59f6Zs4td1ZQUw8NjU0fbpIhl65uQ6lcrnZDVSz1aCNZqxG4daBdP7vPSfE4WQaXIhjCYfY7fFCzZF4r47LGvZAoo6kn4k9EXG5EOkEyn7QlPBkja4jO7M04Ul5g+6LZBE5IAwpaAIAZR8ZAA5kEod5WAq4SM9Hw6KxSNAAAYAEmwd3SFDyeol+EB+FAkBgAFkAJ4AcTKbDAAVY6ugalY3jMcAstQkKls6kyTjs8mWAGtkI6aCqFa4tPLxjoPQklRDagBtAC63ux6bArFYOcwBcyBZeGECiJxkwehPgWDuaYEGwsSsxjJInTZyF7K2GpdY7xMWcHURe+Uu3OGmu1urHlrcHi8Pj8nqCcYT0CTpHlw+Gdz3mT3a60YEQiBEFWQAHcAyJalCYS1Lo3EJ5wdAmPA8BjGAurKBgYAgBAyApiMAD0sHQAAkm2CSir63gUiQMCVBMYb2AANL8ZS-MkFKXPBWFET6xB+hMAT-qKN4oAo9GJKKEB0EwABWyD+CklwIkiPToSKSiKI4qjqCePLIiJ-I8M+zzkj+PCzL40HzuRCHISR2FPphCSQNAYCjPAj5sFklC-CBVEiRS+FaURupzJhpFsZMj7UbRFL8TcyCQaKgkKSIaTZNAAA8ukpHJaymtJp6yTR-oHHoIKIA+ikoDO5J3DF7IeWSfYqaKyhbhpNzWiMjbANqeikCKFZYKViW0YVIyPkkYyIgAhMV8VEBROnuQpBlGSZIBmRZprWc5qHuLVZQTGCDl9hRbGzaRYIHgkxggAoLA6KlZTMbc8BUTVZaLT55JBU+IXTZFF11SKoWUP1wxPYtIXAsdGUDLOwzFWpdDlSOC5wdpKGip99WYT+yDYfAEyGfojFNktFgrSOa2oSuJTHVRI1baxc0wxjbzkv5UH9oiZMhYOYkSXh8jvUQdNrMUaV-RiANEEDpXqQD4PDBRADybGsI+yTIIRN76CBwCiiTooLNdfZU6KQwjvNl31fy7NvIOvPQPzPoQVBQuaVolXQLBABUdtxHb0CujwrAevWGDSP4RikIRS46mqr5iGQ3gKwjxkwBNR6R07RF6JR3jECAIDGejgY1CHs2iiAZBxgoufeL5wx27Bbh2x2sBdig2ZIXw7pMGM4XB1YobOPIAB8RajOmDPNcJSUii8HXJ6KD7NqK3XiW3UaIO9jrEP5ChG+Sffo-T1eg8MC42zKcpHrXh7yt3Ae6nq0qcTx-jQEaZ7xnkiK38SmYpGMR6JHkUJPz02gv1xTSkCCAAIkIkAqI5pLTWkbGmN2HsvRnH0k6V27odxAIAIIACEADCYDNB1i9EERsxBMgAAZ2AkAitAAAjGQkgABqOhJ5Gzu3IJke0L8MATUCEEdhiQUgsJ-AwJU0BnZUOQAANmyloRsW0EGeRbkEARUiiAwJQYEFITF7xgikdaDcEAgKUgmoqVR7tPQpD3qqA+UQpFAA).
