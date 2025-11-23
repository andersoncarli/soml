import * as htmlparser2 from "htmlparser2";

const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
    },
    ontext(text) {
    },
    onclosetag(tagname) {
        if (tagname === "script") {
            console.log("That's it?!");
        }
    },
});
parser.write(
    "Xyz <script type='text/javascript'>const foo = '<<bar>>';</script>",
);
parser.end();