/* 
Author: Nick Sebasco
Date: 2/ 24/ 2021

Possible Features:
https://www.researchgate.net/figure/Top-5-spam-detection-features-19_tbl2_275647490#:~:text=We%20conduct%20our%20experiments%20using,based%20feature%20selection%20methods%2C%20namely%2C
1. # of capitalized words 
    OR # of characters capitalized
    OR # of words ALL caps
2. avg of all character lengths of words.
3. # of words containing numbers and letters.

Additional Features:
http://docshare01.docshare.tips/files/27444/274447440.pdf
4. Key words (known spam words) - https://snov.io/blog/550-spam-trigger-words-to-avoid/
compile a dictionary of known spam keywords.
5. Spelling/ language errors. (not sure how to check this)
6. Number of non-standard unicode characters.
7. *HTML anchors & HTML Tags.
(# Anchor Tags + # HTML Tags)/ N
-Version 1 will remove all punctuation for simplicity.  So I will not look for tags.

*/

// 1)
// CSV Methods
// ------------------------------------------------------------------------------------
function processTOKENS(token, removePunctuation = true) {
    // Direct modifications to the tokens go here
    // 1. Remove ... (ellipses) OR all periods 
    if (removePunctuation) {
        token = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    } else if (true) {
        token = token.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
    } else {
        pass;
    }
    return token
}

function processCSV(csv, callback)
{
    // Tokenizing the emails: breaking up into constituent
    // words.
    const strip_whitespace = true;
    return callback(csv.split("\n").map((line) => {
        var splitLine = line.split(","),
        label = splitLine.shift(),
        rawData = [
            label,
            splitLine.filter((i)=> i.trim() !== "").join("")
        ];
        console.log("RAW: ", rawData, "label: ", label)

        try{
            //console.log("SPLIT",splitLine)
            //console.log("PROCESSED: ", processTOKENS(splitLine[0]))
            return [label, splitLine.map((v) => {
                v = processTOKENS(v);
                return strip_whitespace ? v.split(" ").filter((x)=> x !== "") : v.split(" ");
            }).reduce((a, b) => {
                return a.concat(b);
            }), rawData];
        } catch(e) {
            return [label, "", rawData];
        }

    }));
}

// 1)
// Feature Extraction
// ------------------------------------------------------------------------------------
function extractFeatures(proccessed, 
    checkCapitals = true,
    checkLetterNumber = true,
    checkSpamWords = false,
    checkCentralWord = false) {
    var featureVectors = [],  labels = [], raw = [], featureName = {};
    // console.log(proccessed.filter((i)=> i[0] === "spam"));
    proccessed.forEach(function(v, i){
        const label = v[0].toLowerCase().trim(), input_vector = v[1];
        if (label === "spam" || label === "ham" || label === "textarea-extract"){
            // console.log("label: ", label, "input_vector: ", input_vector)
            var featureVector = [];
            if (checkCapitals) {
                featureName["# Capitalized"] = null;
                featureVector.push(howManyCaptials(input_vector));
            } 
            if (checkLetterNumber) {
                featureName["# Letter & Number"] = null;
                featureVector.push(howManyNumberAndLetter(input_vector));
            }
            if (checkSpamWords) {
                featureName["# Spam Words"] = null;
                featureVector.push(howManySpamWords(input_vector));
            }
            if (checkCentralWord) {
                // console.log(input_vector, centralWordLength(input_vector))
                featureName["Mean Length"] = null;
                featureVector.push(centralWordLength(input_vector));
            }
            // console.log(featureVector);
            featureVectors.push(featureVector);
            labels.push(label);
            raw.push(v[2]);
        }
    });
    return [labels, featureVectors, raw, Object.keys(featureName)];
}

function textAreaFeatureExtraction(v,
    checkCapitals = true,
    checkLetterNumber = true,
    checkSpamWords = true,
    checkCentralWord = false) {
    v = processTOKENS(v);
    console.log("pt v: ", v)
    v = v.split(" ").filter((x)=> x !== "")

    return extractFeatures([["textarea-extract",v,[]]], checkCapitals, checkLetterNumber, checkSpamWords, checkCentralWord);
}

// 1A) Number of capitalized words in an email
function howManyCaptials(words, allCaps = false){
    // default behavior:  count words in a list that are capitalized.
    // allCaps flag: count only words that are all caps in a list.
    var count = 0;
    words.forEach(function(w){
        if ( allCaps && (w.toUpperCase() === w) ) {
            count ++;
        } 
        else if ( w[0].toUpperCase() === w[0] ) {
            count ++;
        } 
    });
    return count;
}

// 1B) Number of words with letters and numbers
function howManyNumberAndLetter(words){
    // default behavior:  count words in a list that are capitalized.
    // allCaps flag: count only words that are all caps in a list.
    var count = 0;
    words.forEach(function(w){
        if ( /[a-z]/ig.test(w) && /[0-9]/g.test(w) ) {
            count ++;
        }
    });
    return count;
}

// 1C) Number of words with letters and numbers
function howManySpamWords(words){
    // default behavior:  count words in a list that are capitalized.
    // allCaps flag: count only words that are all caps in a list.
    const SPAM_WORDS = {
        "accept credit":null,
        "acceptance":null,
        "access":null,
        "access now":null,
        "access free":null,
        "accordingly":null,
        "act now":null,
        "act immediately":null,
        "action":null,
        "additional income":null,
        "addresses":null,
        "affordable":null,
        "all natural":null,
        "all new":null,
        "amazed":null,
        "amazing":null,
        "apply here":null,
        "apply now":null,
        "apply online":null,
        "as seen on":null,
        "at no cost":null,
        "auto email removal":null,
        "avoid":null,
        "avoid bankruptcy":null,
        "0%":null,
        "0% risk":null,
        "777":null,
        "99%":null,
        "99.9%	100%":null,
        "100% more":null,
        "#1":null,
        "$$$":null,
        "100% free":null,
        "bargain":null,
        "be amazed":null,
        "be surprised":null,
        "be your own boss":null,
        "believe me":null,
        "being a member":null,
        "beneficiary":null,
        "best bargain":null,
        "best deal	best price":null,
        "best offer":null,
        "beverage":null,
        "big bucks":null,
        "bill 1618":null,
        "billing":null,
        "billing address":null,
        "billionaire":null,
        "billion	billion dollars":null,
        "bonus":null,
        "boss":null,
        "brand new pager":null,
        "bulk email":null,
        "buy":null,
        "buy now":null,
        "buy direct":null,
        "buying judgments":null,
        "cable converter":null,
        "call":null,
        "call free":null,
        "call me":null,
        "call now":null,
        "calling creditors":null,
        "can’t live without":null,
        "cancel":null,
        "cancellation required":null,
        "cannot be combined with any other offer":null,
        "cards accepted":null,
        "cash":null,
        "cash out":null,
        "cash bonus":null,
        "cashcashcash":null,
        "casino":null,
        "celebrity	cell phone cancer scam":null,
        "cents on the dollar":null,
        "certified":null,
        "chance":null,
        "cheap":null,
        "check":null,
        "check or money order":null,
        "claims":null,
        "claim now":null,
        "claim your discount":null,
        "claims not to be selling anything":null,
        "claims to be in accordance with some spam law":null,
        "claims to be legal":null,
        "clearance":null,
        "click":null,
        "click below":null,
        "click here	click now":null,
        "click to get":null,
        "click to remove":null,
        "collect":null,
        "collect child support":null,
        "compare":null,
        "compare now":null,
        "compare online":null,
        "compare rates":null,
        "compete for your business":null,
        "confidentially on all orders":null,
        "congratulations":null,
        "consolidate debt and credit":null,
        "consolidate your debt":null,
        "copy accurately":null,
        "copy dvds":null,
        "costs":null,
        "credit":null,
        "credit bureaus":null,
        "credit card offers":null,
        "cures":null,
        "cures baldness":null,
        "deal":null,
        "dear [email/friend/somebody]":null,
        "debt":null,
        "diagnostics":null,
        "dig up dirt on friends":null,
        "direct email	direct marketing":null,
        "discount":null,
        "do it now":null,
        "do it today":null,
        "don’t delete":null,
        "don’t hesitate":null,
        "dormant	double your":null,
        "double your cash":null,
        "double your income":null,
        "double your wealth":null,
        "drastically reduced":null,
        "earn":null,
        "earn $":null,
        "earn extra cash":null,
        "earn money":null,
        "earn monthly":null,
        "earn from home":null,
        "earn per month":null,
        "earn per week	easy terms":null,
        "eliminate bad credit":null,
        "eliminate debt":null,
        "email extractor":null,
        "email harvest":null,
        "email marketing":null,
        "exclusive deal	expect to earn":null,
        "expire":null,
        "explode your business":null,
        "extra":null,
        "extra cash":null,
        "extra income":null,
        "extract email":null,
        "f r e e":null,
        "fantastic":null,
        "fantastic deal":null,
        "fantastic offer":null,
        "fast cash":null,
        "fast viagra delivery":null,
        "financial freedom":null,
        "financially independent":null,
        "for free":null,
        "for instant access":null,
        "for just $ (some amount)":null,
        "for just $xxx":null,
        "for only":null,
        "for you	form":null,
        "free":null,
        "free access":null,
        "free bonus":null,
        "free cell phone":null,
        "free consultation":null,
        "free dvd":null,
        "free gift":null,
        "free grant money":null,
        "free hosting":null,
        "free info":null,
        "free information":null,
        "free installation":null,
        "free instant":null,
        "free investment":null,
        "free iphone	free leads":null,
        "free macbook":null,
        "free membership":null,
        "free money":null,
        "free offer":null,
        "free preview":null,
        "free priority mail":null,
        "free quote":null,
        "free sample":null,
        "free trial":null,
        "free website":null,
        "freedom":null,
        "full refund":null,
        "get it now":null,
        "get out of debt":null,
        "get paid":null,
        "get started now":null,
        "gift certificate	give it away":null,
        "giving away":null,
        "great":null,
        "great deal":null,
        "great offer	guarantee":null,
        "guaranteed":null,
        "guaranteed deposit":null,
        "guaranteed income":null,
        "guaranteed payment":null,
        "have you been turned down?":null,
        "hidden assets	hidden charges":null,
        "hidden fees":null,
        "high score":null,
        "home based	home employment":null,
        "home based business":null,
        "human growth hormone":null,
        "huge discount":null,
        "hurry up":null,
        "if only it were that easy":null,
        "important information regarding":null,
        "important notification":null,
        "in accordance with laws":null,
        "income":null,
        "income from home	increase sales":null,
        "increase traffic":null,
        "increase your chances":null,
        "increase your sales":null,
        "incredible deal":null,
        "info you requested":null,
        "information you requested":null,
        "instant	instant earnings":null,
        "instant income":null,
        "insurance":null,
        "insurance":null,
        "internet market":null,
        "internet marketing":null,
        "investment":null,
        "investment decision":null,
        "it’s effective":null,
        "join millions":null,
        "join millions of americans":null,
        "junk":null,
        "laser printer":null,
        "leave":null,
        "legal":null,
        "legal notice":null,
        "life":null,
        "life insurance":null,
        "lifetime":null,
        "lifetime access":null,
        "lifetime deal":null,
        "limited amount	limited number":null,
        "limited offer":null,
        "limited supply":null,
        "limited time":null,
        "limited time offer":null,
        "limited time only":null,
        "loan":null,
        "long distance phone offer":null,
        "lose	lose weight":null,
        "lose weight spam":null,
        "lower interest rates":null,
        "lower monthly payment":null,
        "lower your mortgage rate":null,
        "lowest insurance rates":null,
        "lowest price":null,
        "lowest rate":null,
        "luxury":null,
        "luxury car":null,
        "mail in order form":null,
        "maintained":null,
        "make $":null,
        "make money":null,
        "marketing":null,
        "marketing solutions":null,
        "mass email":null,
        "medicine":null,
        "medium":null,
        "meet girls":null,
        "meet me	meet singles":null,
        "meet women":null,
        "member":null,
        "member stuff":null,
        "message contains":null,
        "message contains disclaimer":null,
        "million":null,
        "millionaire":null,
        "million dollars	miracle":null,
        "mlm":null,
        "money":null,
        "money back":null,
        "money making":null,
        "month trial offer":null,
        "more internet traffic":null,
        "mortgage":null,
        "mortgage rates":null,
        "multi-level marketing":null,
        "name brand":null,
        "never before":null,
        "new customers only":null,
        "new domain extensions":null,
        "nigerian":null,
        "no age restrictions":null,
        "no catch":null,
        "no claim forms":null,
        "no cost":null,
        "no credit check":null,
        "no deposit required":null,
        "no disappointment":null,
        "no experience":null,
        "no fees":null,
        "no gimmick":null,
        "no hidden":null,
        "no hidden сosts":null,
        "no hidden fees":null,
        "no interests":null,
        "no inventory":null,
        "no investment":null,
        "no investment required":null,
        "no medical exams":null,
        "no middleman":null,
        "no obligation":null,
        "no payment required":null,
        "no purchase necessary":null,
        "no questions asked":null,
        "no selling":null,
        "no strings attached":null,
        "no-obligation":null,
        "not intended":null,
        "not junk":null,
        "not scam":null,
        "not spam":null,
        "now only":null,
        "number 1":null,
        "number one":null,
        "obligation":null,
        "offshore":null,
        "offer":null,
        "offer expires":null,
        "once in lifetime":null,
        "once in a lifetime":null,
        "one hundred percent free":null,
        "one hundred percent guaranteed":null,
        "one time":null,
        "one time mailing":null,
        "online biz opportunity":null,
        "online degree":null,
        "online job":null,
        "online income":null,
        "online marketing":null,
        "online pharmacy":null,
        "only":null,
        "only $":null,
        "open":null,
        "opportunity":null,
        "opt in":null,
        "order":null,
        "order now":null,
        "order shipped by":null,
        "order status":null,
        "order today":null,
        "outstanding values":null,
        "passwords":null,
        "pennies a day":null,
        "per day":null,
        "per month":null,
        "per week":null,
        "performance":null,
        "phone":null,
        "please read	potential earnings":null,
        "pre-approved":null,
        "presently":null,
        "price":null,
        "price protection":null,
        "print form signature":null,
        "print out and fax":null,
        "priority mail	prize":null,
        "problem":null,
        "produced and sent out":null,
        "profits":null,
        "promise":null,
        "promise you":null,
        "purchase":null,
        "pure profits":null,
        "quote":null,
        "rates":null,
        "real thing":null,
        "refinance":null,
        "refinance home":null,
        "refund":null,
        "removal":null,
        "removal instructions":null,
        "remove":null,
        "removes wrinkles":null,
        "request":null,
        "request now":null,
        "request today":null,
        "requires initial investment":null,
        "reserves the right":null,
        "reverses":null,
        "reverses aging":null,
        "risk free":null,
        "risk-free":null,
        "rolex":null,
        "round the world":null,
        "s 1618":null,
        "safeguard notice":null,
        "sale":null,
        "sample":null,
        "satisfaction":null,
        "satisfaction guaranteed":null,
        "save $":null,
        "save money":null,
        "save now":null,
        "save big money":null,
        "save up to":null,
        "score":null,
        "score with babes":null,
        "search engine listings":null,
        "search engines":null,
        "section 301":null,
        "see for yourself":null,
        "sent in compliance":null,
        "serious":null,
        "serious cash":null,
        "serious only":null,
        "serious offer":null,
        "shopper":null,
        "shopping spree":null,
        "sign up free today":null,
        "social security number":null,
        "solution":null,
        "spam":null,
        "special deal":null,
        "special discount":null,
        "special for you":null,
        "special offer":null,
        "special promotion":null,
        "stainless steel":null,
        "stock alert":null,
        "stock disclaimer statement":null,
        "stock pick":null,
        "stop":null,
        "stop calling me":null,
        "stop emailing me":null,
        "stop snoring":null,
        "strong buy":null,
        "stuff on sale":null,
        "subject to cash":null,
        "subject to credit":null,
        "subscribe":null,
        "subscribe now":null,
        "subscribe for free":null,
        "success":null,
        "supplies":null,
        "supplies are limited":null,
        "take action":null,
        "take action now":null,
        "talks about hidden charges":null,
        "talks about prizes":null,
        "teen":null,
        "tells you it’s an ad":null,
        "terms":null,
        "terms and conditions":null,
        "the best rates":null,
        "the following form":null,
        "they keep your money — no refund!":null,
        "they’re just giving it away":null,
        "this isn’t a scam":null,
        "this isn’t junk":null,
        "this isn’t spam":null,
        "this won’t last":null,
        "thousands":null,
        "time limited":null,
        "traffic":null,
        "trial":null,
        "undisclosed recipient":null,
        "university diplomas":null,
        "unlimited":null,
        "unsecured credit":null,
        "unsecured debt":null,
        "unsolicited	unsubscribe":null,
        "urgent":null,
        "us dollars":null,
        "vacation":null,
        "vacation offers":null,
        "valium":null,
        "viagra	vicodin":null,
        "vip":null,
        "visit our website":null,
        "wants credit card":null,
        "warranty":null,
        "warranty expired":null,
        "we hate spam":null,
        "we honor all":null,
        "web traffic":null,
        "website visitors":null,
        "weekend getaway":null,
        "weight	weight loss":null,
        "what are you waiting for?":null,
        "what’s keeping you?":null,
        "while available":null,
        "while in stock":null,
        "while supplies last":null,
        "while you sleep":null,
        "who really wins?":null,
        "why pay more?":null,
        "wife":null,
        "will not believe your eyes":null,
        "win":null,
        "winner":null,
        "winning":null,
        "won":null,
        "work from home":null,
        "xanax":null,
        "you are a winner!":null,
        "you have been chosen":null,
        "you have been selected	your chance":null,
        "your income":null,
        "your status":null,
        "zero chance":null,
        "zero percent":null,
        "zero risk": null
    };
    var count = 0;
    words.forEach(function(w, i){
        console.log("weord_test: ", w, SPAM_WORDS.hasOwnProperty(w))
        w = w.trim().toLowerCase();
        if ( SPAM_WORDS.hasOwnProperty(w) ) {
            count ++;
            // console.log("Spam word: ",w);
        } else if (i > 0 &&  SPAM_WORDS.hasOwnProperty(words[i-1] + " " + w)) {
            count ++;
            //console.log("Spam word: ", words[i-1] + " " + w);
        }
    });
    console.log("SPAM COUNT:", count );
    return count;
}

// 1D) Average word length
function centralWordLength(words, center_measure = "mean"){
    // computes the central word length of a message.
    // measures of center include: "mean" & "median"
    if (center_measure === "mean") {
        try{
            return words.map((i)=> i.length).reduce((a, b)=> a + b) / words.length;
        } catch (e) { return 0; }
    }
    else if (center_measure === "median") {
        // coming soon
    }
}

// 2)
// Machine Learning Methods
// ------------------------------------------------------------------------------------
function sign(x) {
    // sign: R -> {-1,+1} | specifically 1 if x > 0 and -1 otherwise.
    return x >= 0 ? 1 : -1; 
}

function dot(u, v) {
    if (u.length !== v.length) {
        console.log(u.length, v.length);
        throw("invalid dimenions");
    }
    var total = 0;
    for (let i = 0; i < u.length; ++i) {
        total += u[i] * v[i];
    }
    return total;
}

function vector_sum(u, v) {
    // compute the vector sum described below:
    // u = [u1, u2, ..., un], v = [v1, v2, ..., vn]
    // z = u + v = [u1 + v1, u2 + v2, ..., un + vn]
    var z = Array(u.length);
    for (let i = 0; i < u.length; ++i) {
        z[i] = u[i] + v[i];
    }
    return z;
}

function scale_vector(alpha, v) {
    // scale a vetcor by some constant alpha:
    // alpha * v = alpha * [v1, v2, ..., vn] = [alpha * v1, alpha * v2, ..., alpha * vn]
    return v.map((u)=>alpha * u);
}

function perceptron_classifier_compact(weights, test) {
    //Using a more compact notation and linear algebra.  Take the vector dot product 
    //of the transpose of the weights and the test vector.
    //.item() will return the first element from a vector/ matrix and sice we have
    //a 1x1 or a scalar, we are simply pulling out our scalar.
    //x0 = 1 -> I need to manually stitch a 1 to the front of these vectors.
    //w0 = bias
    //(1xd)T * 1xd -> dx1 * 1xd thus the product dimension = 1*1 or a scalar
    return sign(dot(weights, test));
}

function shuffle(array1, array2 = null) {
    // An extension of the Durstenfeld shuffle algorithm that can shuffle 2 arrays the same way, optimized fisher-yates algorithm.
    // In place shuffle of an array.
    for (var i = array1.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), temp1 = array1[i];
        array1[i] = array1[j];
        array1[j] = temp1;
        if (array2) {
            var temp2 = array2[i];
            array2[i] = array2[j];
            array2[j] = temp2;
        }
    }
}

function zeroes (n) {
    // returns an n-length array of 0's
    return Array(n).fill(0);
}

function perceptron_learning_algorithm({
    train,
    weights = null,
    permute = true,
    max_iterations = Infinity,
    learning_rate = 1.0,
    random_init =  true,
    ALLOWED_ERROR = 1
    } = {}){
    // parameters:
    //    train: [
    //        (xi: np.array(float, ...), yi: {+1, -1})
    //    ]
    //    weights: np.array(float, ...) | default None -> np.array[0,...]
    //    permute:
    //    max_iterations: # of maximum allowed iterations.  default set at infinity.
    //    learning rate: This is a scaling factor for the update rule.  The correction nudge
    //        given to the weight vector during an update can be scaled by this "hyperparameter".
    //    random_init: boolean specifying whether or not the weight vector should be randomly initialized.
    //    ALLOWED ERROR specifies how many inccorect classifications can be tolerated before termination.
    // Assumptions:
    //     + Data set is linearly separable.  If it is not we risk infinite iteration.
    //    To mitigate this we can set max_iterations or throw an error. This can 
    //    be restated as there exists a vector w such that all transpose(w)x_n = y_n
    //    on all training examples.
    // Return:
    //    (np.array, int): 
    //        np.array: represents our weights which constitutes the hyperplane that separates
    //        our data. 
    //        int: represents the number of points that remain misclassified.
    //        int: # of iterations to reach solution. 

    // # 0) Optionally randomly shuffle the training set
    console.log("train: ", train, "weights: ", weights, "permute: ", permute, "max_iterations: ", max_iterations, "learning_rate:", learning_rate)

    // need to transform ["spam", "ham", ...] binary space into [1, -1]
    var train_Y = train[1].map((i) => {
        if (i.trim().toLowerCase() === "ham") {
            return 1;
        } else if (i.trim().toLowerCase() === "spam") {
            return -1;
        } else {
            throw ("unknown label detected: "+i);
        }
        }), 
        train_X = train[0].map((i)=> [1,...i]);
        
    console.log("train x: ", train_X);
    // console.log("train y: ", train_Y);
    if (permute) {
        // Copy arrays pre-shuffle
        train_Y = [...train_Y];
        train_X = [...train_X];

        //shuffle(train_Y);
        //shuffle(train_X);
    }

    // # 1) initialize weights (if needed)
    if (random_init) {
        const randomFactor = 100;
        weights = Array(train_X[0].length).fill(0).map((i)=> Math.random() * randomFactor);
        console.log("CASE 2) random vector - ", weights)
    } else if (!weights) {
        console.log("CASE 3) zero vector - ", weights)
        weights = zeroes(train_X[0].length);
    }

    // # 2) this variable will track how many correct classifications we have.
    var correctly_classified = 0,
        i = 0; 

    // # 3) Iterate through training set as long as we have misclassified data. 
    // # i: int = current iteration, t: tuple = (xi, yi)
    while (true) {
        console.log("correctly classfied: ", correctly_classified)
        // # 3a) unpack training example & test for misclassification
        i = (i + 1);

        // Extract the ith feature vector & label
        var x = train_X[i % train_X.length], y = train_Y[i % train_X.length];
        console.log("i: ", i, "xi: ", x, "yi: ", y, "wi:", weights);

        // Check if classification is correct
        if (y * perceptron_classifier_compact(weights, x) > 0) {
            correctly_classified += 1;
        }  
        // Otherwise update the weights
        else {
            // console.log("scaled x: ",scale_vector(learning_rate * y, x))
            weights = vector_sum(weights, scale_vector(learning_rate * y, x));
            correctly_classified = 0;
        }

        // # 3b) 3 possible ways this program terminates:
        // # 1. correct classification for all traing examples
        // # 2. exceeded max iterations
        // # 3. infinite loop (never happens if max_iterations is set)
        
        if (correctly_classified == (train_X.length-ALLOWED_ERROR) || i >= max_iterations) {
            return [weights, train_X.length - correctly_classified, i];    
        }
    }
      
    /*
        if y * perceptron_classifier_compact(weights, x) > 0:
            correctly_classified += 1
        else:
            // # update the weights
            weights = weights + (learning_rate * y * x)
            correctly_classified = 0
        // # 3b) 3 possible ways this program terminates:
        // # 1. correct classification for all traing examples
        // # 2. exceeded max iterations
        // # 3. infinite loop (never happens if max_iterations is set)
        if correctly_classified == len(train) or i >= max_iterations:
            // # Case 1) correct classification for all training examples. 
            // # Case 2) we failed to find a solution within max_iterations.
            return (weights, len(train) - correctly_classified, i)
        // # Case 3) infinite loop because we failed to meet the criterion 
        // # of linear separability
        // # print("iteration: ", i)
    */
}

// 3)
// Graph Methods
// ------------------------------------------------------------------------------------

function plot_3D(id, X, Y, size1 = 6, size2 = 4, featureName = ['x', 'y', 'z', 'z\''], weights = undefined){
    // Generate 3-dimensional input space
    // plot spam & ham input vectors in this space.
    console.log("Plot 4 Y: ", Y)
    const nspam = X.map((v, i)=> Y[i] === "spam" ? v[0] : undefined).filter((i)=>i !== undefined).length,
        nham = X.map((v, i)=> Y[i] === "ham" ? v[0] : undefined).filter((i)=>i !== undefined).length;
    
    var trace1, tace5, trace6;

    if (X[0].length === 3) {
        trace1 = {
            x : X.map((v, i)=> Y[i] === "spam" ? v[0] : undefined).filter((i)=>i !== undefined),
            y: X.map((v, i)=> Y[i] === "spam" ? v[1] : undefined).filter((i)=>i !== undefined),
            z : X.map((v, i)=> Y[i] === "spam" ? v[2] : undefined).filter((i)=>i !== undefined),
            mode: 'markers',
            name: `spam ${nspam}`,
            marker: {
              size: size1,
              line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5
              },
              opacity: 0.8
            },
            type: 'scatter3d'
          };
          
        trace5 = {
            x : X.map((v, i)=> Y[i] === "ham" ? v[0] : undefined).filter((i)=>i !== undefined),
            y: X.map((v, i)=> Y[i] === "ham" ? v[1] : undefined).filter((i)=>i !== undefined),
            z : X.map((v, i)=> Y[i] === "ham" ? v[2] : undefined).filter((i)=>i !== undefined),
            mode: 'markers',
            name: `ham  ${nham}`,
            marker: {
              size: size2,
              line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5
              },
              opacity: 0.8
            },
            type: 'scatter3d'
          };
    } else if (X[0].length === 2) {
        trace1 = {
            x : X.map((v, i)=> Y[i] === "spam" ? v[0] : undefined).filter((i)=>i !== undefined),
            y: X.map((v, i)=> Y[i] === "spam" ? v[1] : undefined).filter((i)=>i !== undefined),
            mode: 'markers',
            name: `spam ${nspam}`,
            marker: {
              size: size1,
              line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5
              },
              opacity: 0.8
            },
            type: 'scatter'
          };
          
        trace5 = {
            x : X.map((v, i)=> Y[i] === "ham" ? v[0] : undefined).filter((i)=>i !== undefined),
            y: X.map((v, i)=> Y[i] === "ham" ? v[1] : undefined).filter((i)=>i !== undefined),
            mode: 'markers',
            name: `ham  ${nham}`,
            marker: {
              size: size2,
              line: {
                color: 'rgba(217, 217, 217, 0.14)',
                width: 0.5
              },
              opacity: 0.8
            },
            type: 'scatter'
          };
    }

    if (weights) {
        
        if (weights.length === 3) {
            let b = -(weights[0])/weights[2];
            let m = -(weights[0]/weights[2])/(weights[0]/weights[1]) ;
            alert(`attempting to plot weights ${m}x + ${b}`)
            let f = (x) => m*x + b,
                domain = [0,1,2,3,4,5,6,7,8,9,10];
            trace6 = {
                x : domain,
                y: domain.map(f),
                mode: 'line',
                name: `2-d hyperplane`,
                type: 'scatter'
              };
        } else if ( weights.length === 4) {
            pass;
        } else {
            alert(`sorry we don't do ${weights.length -1 } - dimension yet!`);
        }
    }

      var data = trace6 ? [trace1,trace5,trace6] : [trace1,trace5];
      console.log("data length: ",data.length);
      var layout = {
        autosize: true,
          margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0
        },
        xaxis:{automargin: true, title: {text: featureName[0]}},
        yaxis:{automargin: true, title: {text: featureName[1]}},
        scene: {
            xaxis:{automargin: true, title: featureName[0]},
            yaxis:{automargin: true, title: featureName[1]},
            zaxis:{automargin: true, title: featureName[2]},
            },
        };

      document.querySelector(`#${id}`).innerHTML = "";
      Plotly.newPlot(id, data, layout);
    
}

// 4)
// HTML UI Methods
// ------------------------------------------------------------------------------------
function toggleDataset(dat) {
    var dataTable = "<table><tbody>"
    dat.forEach((i)=> {
        dataTable += `
        <tr>
            <td>${i[0]}</td><td>${i[1]}</td>
        </tr>
        `;
    });
    dataTable += "</tbody></table>";
    document.querySelector("#figure1").innerHTML = dataTable;
}

(function main(){
    console.log("1) Extracting Features: ");
    const figure1_height = "80vh";
    var pct = 1;
    var dataset = artificial_spam; //artificial_spam;
    var data = processCSV(dataset, extractFeatures);
    var rawData = data[2];
    var featureName = data[3];

    shuffle(data[0], data[1]);
    console.log("Sample Size: ",data[0].length);
    var train_X = data[0].slice(0, Math.floor(pct*data[0].length));
    var train_Y = data[1].slice(0, Math.floor(pct*data[1].length));
    console.log("Train sample size: ", train_X.length)

    var test_X = data[0].slice(Math.floor(pct*data[0].length), data[0].length + 1 );
    var test_Y = data[1].slice(Math.floor(pct*data[1].length), data[1].length + 1 );

    // default perceptron parameter values
    var learning_rate = 1;
    var max_iterations = 1_000;
    var model = null; // holds output from learning algorithm

    // plot constants
    var size1 = 12, size2 = 10;

    // Attach interface methods, once HTML content has loaded:
    window.onload = () => {

        // generating initial plot:
        plot_3D("figure1", train_Y, train_X, size1, size2, featureName);

        // updating dataset size & train sample size:
        document.querySelector("#data-size").innerHTML = data[0].length;
        document.querySelector("#sample-size").innerHTML = train_X.length;

        // clicking on the toggle-dataset button
        document.querySelector("#toggle-dataset").onclick = () => {
            if ( document.querySelector("#toggle-dataset").innerText === "Show Data Table") {
                document.querySelector("#figure1").style.overflowY = "scroll";
                document.querySelector("#figure1").style.height = figure1_height;

                document.querySelector("#toggle-dataset").innerText = "Show Graph";
                toggleDataset(rawData);
            } else {
                document.querySelector("#toggle-dataset").innerText = "Show Data Table";
                plot_3D("figure1", train_Y, train_X, size1, size2, featureName);
            }
        };
        
        // Update features
        function updateData() {
            var activeFeatures = Array.from(document.getElementsByClassName("feature")).filter((i)=>i.checked).map((i)=>String(i.value));
                switch(activeFeatures.length) {
                    case 0:
                        alert("Error, you need at least one feature!");
                        document.querySelector("#figure1").innerHTML = "<strong>Error (You need more Features!)</strong>";
                        break;
                    case 1:
                        alert("Error, you need at least two features!");
                        document.querySelector("#figure1").innerHTML = "<strong>Error (You need more Features!)</strong>";
                        break;
                    case 2:
                        data = processCSV(dataset, (proccessed) => { return extractFeatures(proccessed, 
                            checkCapitals = true && ((activeFeatures[0] === '1') || (activeFeatures[1] === '1')),
                            checkLetterNumber = true && ((activeFeatures[0] === '2') || (activeFeatures[1] === '2')),
                            checkSpamWords = true && ((activeFeatures[0] === '3') || (activeFeatures[1] === '3')),
                            checkCentralWord = true && ((activeFeatures[0] === '4') || (activeFeatures[1] === '4'))) });
                        rawData = data[2];
                        featureName = data[3];

                        shuffle(data[0], data[1]);
                        train_X = data[0].slice(0, Math.floor(pct*data[0].length));
                        train_Y = data[1].slice(0, Math.floor(pct*data[1].length));

                        test_X = data[0].slice(Math.floor(pct*data[0].length), data[0].length + 1 );
                        test_Y = data[1].slice(Math.floor(pct*data[1].length), data[1].length + 1 );
                        document.querySelector("#data-size").innerHTML = data[0].length;
                        document.querySelector("#sample-size").innerHTML = train_X.length;
                        if (document.querySelector("#toggle-dataset").innerText === "Show Data Table") {
                            
                            plot_3D("figure1", train_Y, train_X, size1, size2, featureName);
                        }
                        else {
                            toggleDataset(rawData);
                        }
                        alert("2-D input space");
                        break;
                    case 3:
                        data = processCSV(dataset, (proccessed) => { return extractFeatures(proccessed, 
                            checkCapitals = true && ((activeFeatures[0] === '1') || (activeFeatures[1] === '1') || (activeFeatures[2] === '1')),
                            checkLetterNumber = true && ((activeFeatures[0] === '2') || (activeFeatures[1] === '2') || (activeFeatures[2] === '2')),
                            checkSpamWords = true && ((activeFeatures[0] === '3') || (activeFeatures[1] === '3') || (activeFeatures[2] === '3')),
                            checkCentralWord = true && ((activeFeatures[0] === '4') || (activeFeatures[1] === '4') || (activeFeatures[2] === '4'))) });
                        rawData = data[2];
                        featureName = data[3];

                        shuffle(data[0], data[1]);
                        train_X = data[0].slice(0, Math.floor(pct*data[0].length));
                        train_Y = data[1].slice(0, Math.floor(pct*data[1].length));

                        test_X = data[0].slice(Math.floor(pct*data[0].length), data[0].length + 1 );
                        test_Y = data[1].slice(Math.floor(pct*data[1].length), data[1].length + 1 );
                        document.querySelector("#data-size").innerHTML = data[0].length;
                        document.querySelector("#sample-size").innerHTML = train_X.length;
                        if (document.querySelector("#toggle-dataset").innerText === "Show Data Table") {
                            
                            plot_3D("figure1", train_Y, train_X, size1, size2, featureName);
                        }
                        else {
                            toggleDataset(rawData);
                        }
                        alert("3-D input space");
                        break;
                    case 4:
                        alert("4-D input space, coming soon.  Please choose between 2-3 features.");
                        break;
                }
        }
        Array.from(document.getElementsByClassName("feature")).forEach((feature)=>{
            feature.onclick = function (e) {
                updateData();
            };
        });
        document.querySelector("#gen-sample").onclick = () => {
            updateData();
        };
        document.querySelector("#data-pct").onchange = function () {
            if (!isNaN(parseFloat(this.value))) {
                pct = parseFloat(this.value);
            } else {
                this.value = pct;
                alert("Must be a real number in [0, 1].")
            }
            
        }
        document.querySelector("#start-learning").onclick = () => {
            console.log("2) Learning to classify SPAM!")
            let max_iter = parseInt(document.querySelector("#max-iterations").value),
                learn_rate = parseInt(document.querySelector("#learn-rate").value),
                allowed_error = parseInt(document.querySelector("#allowed-error").value),
                rand_init = document.querySelector("#weight-vector-init").value === "2";
            max_iter = isNaN(max_iter) ? max_iterations : max_iter;
            learn_rate = isNaN(learn_rate) ? learning_rate : learn_rate;
            model = perceptron_learning_algorithm({train : [train_Y, train_X], max_iterations : max_iter, learning_rate: learn_rate, random_init: rand_init, ALLOWED_ERROR: allowed_error});
            document.querySelector("#perceptron-weights").innerHTML = model[0].map((i)=>i.toFixed(2));
            document.querySelector("#perceptron-error").innerHTML = model[1];
            plot_3D("figure1", train_Y, train_X, size1, size2, featureName, model[0])
        };

        document.querySelector("#classify-btn").onclick = function () {
            var activeFeatures = Array.from(document.getElementsByClassName("feature")).filter((i)=>i.checked).map((i)=>String(i.value));
            let extracted = textAreaFeatureExtraction(document.querySelector("textarea").value,
            checkCapitals = true && ((activeFeatures[0] === '1') || (activeFeatures[1] === '1') || (activeFeatures[2] === '1')),
                            checkLetterNumber = true && ((activeFeatures[0] === '2') || (activeFeatures[1] === '2') || (activeFeatures[2] === '2')),
                            checkSpamWords = true && ((activeFeatures[0] === '3') || (activeFeatures[1] === '3') || (activeFeatures[2] === '3')),
                            checkCentralWord = true && ((activeFeatures[0] === '4') || (activeFeatures[1] === '4') || (activeFeatures[2] === '4')));
            let test = [1].concat(extracted[1][0]);
            console.log("extracted: ", extracted, extracted[1], extracted[2], extracted[1][0])
            console.log(test, model[0])
            alert(perceptron_classifier_compact(model[0], test) < 1 ? "SPAM" : "NOT SPAM");
            
        };
        document.querySelector("#data-select").onchange = function () {
            if( this.value === '1' ) {
                dataset = artificial_spam;
            } else {
                dataset = spam_data;
            }
            updateData();
        }
    };
    /*
    console.log("2) Learning to classify SPAM!")
    model = perceptron_learning_algorithm({train : [train_Y, train_X], max_iterations : 5_000});
    console.log("weights: ", model[0], "error: ", model[1], "iterations: ", model[2]);
    console.log(rawData);
    console.log("Features: ", featureName)
    */
})();


