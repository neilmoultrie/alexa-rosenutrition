/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';
const Alexa = require('ask-sdk-core');

const APP_ID = 'amzn1.ask.skill.088fc8f4-6c0b-4227-a8e3-4e2fb7a54a44';

const dbHelper = require('./dbHelper');

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak(WELCOME_MESSAGE)
			.reprompt(HELP_REPROMPT)
			.getResponse();
	},
};

const FallbackHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_MESSAGE)
            .reprompt(HELP_REPROMPT)
            .getResponse();
    }
};

const InProgressRecommendationIntent = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        
        return request.type === 'IntentRequest'
            && request.intent.name === 'RecommendationIntent'
            && request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        console.log(JSON.stringify(this.event));
        const listOfMeals = getListOfMeals();
        
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        let prompt = '';
        
        for(const slotName in currentIntent.slots) {
            if (Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
                const currentSlot = currentIntent.slots[slotName];
                if(currentSlot.confirmationStatus !== 'CONFIRMED' && currentSlot.resolutions && currentSlot.resolutions.resolutionsPerAuthority[0]) {
                    if(currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                        if(currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                            prompt = 'Which would you like';
                            const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
                            
                            currentSlot.resolutions.resolutionsPerAuthority[0].values
                                .forEach((element, index) => {
                                    prompt += `${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
                                });
                                
                            prompt += '?';
                            
                            return handlerInput.responseBuilder
                                .speak(prompt)
                                .reprompt(prompt)
                                .addElicitSlotDirective(currentSlot.name)
                                .getResponse();
                        }
                    } else if(currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
                        if(requiredSlots.indexOf(currentSlot.name) > -1) {
                            prompt = `What ${currentSlot.name} do you want`;
                            
                            return handlerInput.responseBuilder
                                .speak(prompt)
                                .reprompt(prompt)
                                .addElicitSlotDirective(currentSlot.name)
                                .getResponse();
                        }
                    }
                }
            }
        }
        
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    }
};

const CompletedRecommendationIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        
        return request.type === 'IntentRequest'
            && request.intent.name === 'RecommendationIntent'
            && request.dialogState === 'COMPLETED';
    },
    handle(handlerInput) {
        const typeRequestedByUser = handlerInput.requestEnvelope.request.intent.slots.type.value;
        const resolvedTypeToSearchBy = handlerInput.requestEnvelope.request.intent.slots.type.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        const mealtimeRequestedByUser = handlerInput.requestEnvelope.request.intent.slots.mealtime.value;
        const mealSelection = meals[resolvedTypeToSearchBy][mealtimeRequestedByUser];
        const recommendedMeal = randomise(mealSelection);
        
        console.log("recommended meal => " + recommendedMeal["name"]);
        
        let outputSpeech = '';
        outputSpeech = "Here's a " + typeRequestedByUser + " " + mealtimeRequestedByUser + " you might like - " + recommendedMeal["name"];
        
        return handlerInput.responseBuilder
            .speak(outputSpeech)
            .getResponse();
    }
};

const InProgressLogFoodIntent = {
    canHandle(handlerInput){
        const request = handlerInput.requestEnvelope.request;
        
        return request.type === 'IntentRequest'
            && request.intent.name === 'LogFoodIntent'
            && request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        console.log(JSON.stringify(this.event));
        
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        let prompt = '';
        
        for(const slotName in currentIntent.slots) {
            if(Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
                const currentSlot = currentIntent.slots[slotName];
                if(currentSlot.confirmationStatus !== 'CONFIRMED' && currentSlot.resolutions && currentSlot.resolutions.resolutionsPerAuthority[0]) {
                    if(currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                        if(currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                            prompt = 'Which would you like';
                            const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
                            
                            currentSlot.resolutions.resolutionsPerAuthority[0].values
                                .forEach((element, index) => {
                                    prompt += `${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
                                });
                                
                            prompt += '?';
                            
                            return handlerInput.responseBuilder
                                .speak(prompt)
                                .reprompt(prompt)
                                .addElicitSlotDirective(currentSlot.name)
                                .getResponse();
                        }
                    } else if(currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
                        if(requiredLogSlots.indexOf(currentSlot.name) > -1) {
                            prompt = `What ${currentSlot.name} do you want`;
                            
                            return handlerInput.responseBuilder
                                .speak(prompt)
                                .reprompt(prompt)
                                .addElicitSlotDirective(currentSlot.name)
                                .getResponse();
                        }
                    }
                }
            }
        }
        
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    }
};

const CompletedLogFoodIntent = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        
        return request.type === 'IntentRequest'
            && request.intent.name === 'LogFoodIntent'
            && request.dialogState === 'COMPLETED';
    },
    async handle(handlerInput) {
        var mealtimeSubmittedByUser = handlerInput.requestEnvelope.request.intent.slots.meal.value;
		
		var date = new Date();
		var day = date.getUTCDate();
		var yesterday = day - 1;
		var month = date.getUTCMonth();
		var thisMonth = month + 1;
		var yesterdayMeal = ``;
		var fatScore = 0;
		
		var groupSubmittedByUser = handlerInput.requestEnvelope.request.intent.slots.group.value;
		
		if(groupSubmittedByUser === 'fruit') {
			fatScore = 2;
		} else if(groupSubmittedByUser === 'vegetables') {
			fatScore = 1;
		} else if(groupSubmittedByUser === 'protein') {
			fatScore = 5;
		} else if(groupSubmittedByUser === 'dairy') {
			fatScore = 4;
		} else if(groupSubmittedByUser === 'oils') {
			fatScore = 3;
		} else if(groupSubmittedByUser === 'grains') {
			fatScore = 3;
		}
		
		return dbHelper.getMeal(mealtimeSubmittedByUser, day, thisMonth)
			.then((data) => {
				var speechText = `You've already logged this meal. You had `;
				if(data.length == 0) {
					return dbHelper.getMeal(mealtimeSubmittedByUser, yesterday, thisMonth)
						.then((data) => {
							var foodSubmittedByUser = handlerInput.requestEnvelope.request.intent.slots.food.value;
							if(data.length == 0) {
								yesterdayMeal = `nothing`;
								return dbHelper.logMeal(mealtimeSubmittedByUser, foodSubmittedByUser, groupSubmittedByUser, fatScore)
									.then((data) => {
										const speechText = `The ${foodSubmittedByUser} you had for ${mealtimeSubmittedByUser} has been logged`;
										return handlerInput.responseBuilder
											.speak(speechText)
											.getResponse();
									})
									.catch((err) => {
										console.log("Error occured while logging meal");
										const speechText = "Your meal could not be logged. Please start again";
										return handlerInput.responseBuilder
											.speak(speechText)
											.getResponse();
									})
							} else {
								yesterdayMeal += data.map(e => e.FoodEaten).join(", ");
								if(yesterdayMeal == foodSubmittedByUser) {
									return dbHelper.logMeal(mealtimeSubmittedByUser, foodSubmittedByUser)
										.then((data) => {
											const speechText = `You had this for ${mealtimeSubmittedByUser} yesterday, you should get me to recommend you a meal. The ${foodSubmittedByUser} you had for ${mealtimeSubmittedByUser} has been logged`;
											return handlerInput.responseBuilder
												.speak(speechText)
												.getResponse();
										})
										.catch((err) => {
											console.log("Error occured while logging meal");
											const speechText = "Your meal could not be logged. Please start again";
											return handlerInput.responseBuilder
												.speak(speechText)
												.getResponse();
										})
								}
							}
						})
						.catch((err) => {
							const speechText = "I couldn't get that meal right now. Please start again.";
							return handlerInput.responseBuilder
								.speak(speechText)
								.getResponse();
						})
				} else {
					speechText += data.map(e => e.FoodEaten).join(", ");
				}
				return handlerInput.responseBuilder
					.speak(speechText)
					.getResponse();
			})
			.catch((err) => {
				const speechText = "I couldn't get that meal right now. Please start again.";
				return handlerInput.responseBuilder
					.speak(speechText)
					.getResponse();
			})
		
		
			
			console.log(yesterdayMeal + " 2");
    }
};

const InProgressGetMealIntent = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		return request.type === 'IntentRequest'
			&& request.intent.name === 'GetMealIntent'
			&& request.dialogState != 'COMPLETED';
	},
	handle(handlerInput) {
		console.log(JSON.stringify(this.event));
        
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        let prompt = '';
        
        for(const slotName in currentIntent.slots) {
            if(Object.prototype.hasOwnProperty.call(currentIntent.slots, slotName)) {
                const currentSlot = currentIntent.slots[slotName];
                if(currentSlot.confirmationStatus !== 'CONFIRMED' && currentSlot.resolutions && currentSlot.resolutions.resolutionsPerAuthority[0]) {
                    if(currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                        if(currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                            prompt = 'Which would you like';
                            const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
                            
                            currentSlot.resolutions.resolutionsPerAuthority[0].values
                                .forEach((element, index) => {
                                    prompt += `${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
                                });
                                
                            prompt += '?';
                            
                            return handlerInput.responseBuilder
                                .speak(prompt)
                                .reprompt(prompt)
                                .addElicitSlotDirective(currentSlot.name)
                                .getResponse();
                        }
                    } else if(currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
                        if(requiredLogSlots.indexOf(currentSlot.name) > -1) {
                            prompt = `What ${currentSlot.name} do you want`;
                            
                            return handlerInput.responseBuilder
                                .speak(prompt)
                                .reprompt(prompt)
                                .addElicitSlotDirective(currentSlot.name)
                                .getResponse();
                        }
                    }
                }
            }
        }
        
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
	}
};

const CompletedGetMealIntent = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request;
		
		return request.type === 'IntentRequest'
            && request.intent.name === 'GetMealIntent'
            && request.dialogState === 'COMPLETED';
	},
	async handle(handlerInput) {
		const mealtimeSubmittedByUser = handlerInput.requestEnvelope.request.intent.slots.mealtime.value;
		const daySubmittedByUser = handlerInput.requestEnvelope.request.intent.slots.day.value;
		const monthSubmittedByUser = handlerInput.requestEnvelope.request.intent.slots.month.value;
        
        var correctDay = formatDay(daySubmittedByUser);
		var correctMonth = formatMonth(monthSubmittedByUser);
		
		return dbHelper.getMeal(mealtimeSubmittedByUser, correctDay, correctMonth)
			.then((data) => {
				var speechText = `On the ${daySubmittedByUser} of ${monthSubmittedByUser} you had `;
				if(data.length == 0) {
					speechText = `nothing. You didnt log this meal.`;
				} else {
					speechText += data.map(e => e.FoodEaten).join(", ");
				}
				return handlerInput.responseBuilder
					.speak(speechText)
					.getResponse();
			})
			.catch((err) => {
				const speechText = "I couldn't get that meal right now. Please start again.";
				return handlerInput.responseBuilder
					.speak(speechText)
					.getResponse();
			})
	}
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_MESSAGE)
            .reprompt(HELP_REPROMPT)
            .getResponse();
    }
};

const ExitHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent'
            || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(STOP_MESSAGE)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle(handlerInput) {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(error.stack);
        
        return handlerInput.responseBuilder
            .speak('Sorry I can\'t understand the command. Please repeat it.')
            .reprompt('Sorry I can\'t understand the command. Please repeat it.')
            .getResponse();
    }
};

/* ------- Constants ------ */
const skillBuilder = Alexa.SkillBuilders.custom();
const SKILL_NAME = 'rose nutrition';
const WELCOME_MESSAGE = 'Welcome to Rose Nutrition. I can log your meals or recommend a meal for you. What would you like to do?';
const HELP_MESSAGE = 'You can say - log my meal, recommend a meal or you can say exit. What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Bye Bye';

const requiredSlots = [
    'type',
    'mealtime'
];

const requiredLogSlots = [
    'meal',
    'food'
];

const meals = {
    "savoury": {
        "breakfast": [
            {"name": "Eggs Benedict", "fatScore": 5},
            {"name": "Avocado Toast", "fatScore": 3},
            {"name": "Porridge with salt", "fatScore": 3},
            {"name": "Banana and almond shredded wheat", "fatScore": 3}
        ],
        "lunch": [
            {"name": "Tuna Quinoa Salad", "fatScore": 4},
            {"name": "Lentil and vegetable soup", "fatScore": 1},
            {"name": "Kale Caesar salad", "fatScore": 2},
            {"name": "Chicken Soba noodles", "fatScore": 4}
        ],
        "dinner": [
            {"name": "Parmesan and Herb Crusted fish", "fatScore": 3},
            {"name": "Fish tacos", "fatScore": 3},
            {"name": "Lemon Herb chicken with rice", "fatScore": 4},
            {"name": "Garlic Rosemary Pork Chops", "fatScore": 5}
        ]
    },
    "sweet": {
        "breakfast": [
            {"name": "Pancakes", "fatScore": 3},
            {"name": "Porridge with sugar", "fatScore": 4},
            {"name": "French Toast", "fatScore": 3},
            {"name": "Fruit and nut granola bars", "fatScore": 2}
        ],
        "lunch": [
            {"name": "Pancakes", "fatScore": 3},
            {"name": "French Toast", "fatScore": 3},
            {"name": "Fruit and nut granola bars", "fatScore": 2}
        ],
        "dinner": [
            {"name": "Chicken and apricot curry", "fatScore": 4},
            {"name": "Moroccan vegetable stew", "fatScore": 2}
        ]
    }
};

function getListOfMeals() {
    var availableTypes = "";
    
    for(var mealtime in meals["savoury"]) {
        availableTypes = mealtime + ", " + availableTypes;
    }
    
    return availableTypes;
}

function randomise(myData) {
    var i = 0;
    
    i = Math.floor(Math.random() * myData.length);
    return(myData[i]);
}

function formatDay(daySubmittedByUser) {
	var correctDay;
	
	switch(daySubmittedByUser) {
		case "first":
			correctDay = "1";
			break;
		case "second":
			correctDay = "2";
			break;
		case "third":
			correctDay = "3";
			break;
		case "fourth":
			correctDay = "4";
			break;
		case "fifth":
			correctDay = "5";
			break;
		case "sixth":
			correctDay = "6";
			break;
		case "seventh":
			correctDay = "7";
			break;
		case "eighth":
			correctDay = "8";
			break;
		case "ninth":
			correctDay = "9";
			break;
		case "tenth":
			correctDay = "10";
			break;
		case "eleventh":
			correctDay = "11";
			break;
		case "twelfth":
			correctDay = "12";
			break;
		case "thirteenth":
			correctDay = "13";
			break;
		case "fourteenth":
			correctDay = "14";
			break;
		case "fifteenth":
			correctDay = "15";
			break;
		case "sixteenth":
			correctDay = "16";
			break;
		case "seventeenth":
			correctDay = "17";
			break;
		case "eighteenth":
			correctDay = "18";
			break;
		case "nineteenth":
			correctDay = "19";
			break;
		case "twentieth":
			correctDay = "20";
			break;
		case "twenty first":
			correctDay = "21";
			break;
		case "twenty second":
			correctDay = "22";
			break;
		case "twenty third":
			correctDay = "23";
			break;
		case "twenty fourth":
			correctDay = "24";
			break;
		case "twenty fifth":
			correctDay = "25";
			break;
		case "twenty sixth":
			correctDay = "26";
			break;
		case "twenty seventh":
			correctDay = "27";
			break;
		case "twenty eighth":
			correctDay = "28";
			break;
		case "twenty ninth":
			correctDay = "29";
			break;
		case "thirtieth":
			correctDay = "30";
			break;
		case "thirty first":
			correctDay = "31";
			break;
		case "1st":
			correctDay = "1";
			break;
		case "2nd":
			correctDay = "2";
			break;
		case "3rd":
			correctDay = "3";
			break;
		case "4th":
			correctDay = "4";
			break;
		case "5th":
			correctDay = "5";
			break;
		case "6th":
			correctDay = "6";
			break;
		case "7th":
			correctDay = "7";
			break;
		case "8th":
			correctDay = "8";
			break;
		case "9th":
			correctDay = "9";
			break;
		case "10th":
			correctDay = "10";
			break;
		case "11th":
			correctDay = "11";
			break;
		case "12th":
			correctDay = "12";
			break;
		case "13th":
			correctDay = "13";
			break;
		case "14th":
			correctDay = "14";
			break;
		case "15th":
			correctDay = "15";
			break;
		case "16th":
			correctDay = "16";
			break;
		case "17th":
			correctDay = "17";
			break;
		case "18th":
			correctDay = "18";
			break;
		case "19th":
			correctDay = "19";
			break;
		case "20th":
			correctDay = "20";
			break;
		case "21st":
			correctDay = "21";
			break;
		case "22nd":
			correctDay = "22";
			break;
		case "23rd":
			correctDay = "23";
			break;
		case "24th":
			correctDay = "24";
			break;
		case "25th":
			correctDay = "25";
			break;
		case "26th":
			correctDay = "26";
			break;
		case "27th":
			correctDay = "27";
			break;
		case "28th":
			correctDay = "28";
			break;
		case "29th":
			correctDay = "29";
			break;
		case "30th":
			correctDay = "30";
			break;
		case "31st":
			correctDay = "31";
			break;
	}
	
	return correctDay;
}

function formatMonth(monthSubmittedByUser) {
	var correctMonth;
	
	switch(monthSubmittedByUser) {
		case "january":
			correctMonth = "1";
			break;
		case "february":
			correctMonth = "2";
			break;
		case "march":
			correctMonth = "3";
			break;
		case "april":
			correctMonth = "4";
			break;
		case "may":
			correctMonth = "5";
			break;
		case "june":
			correctMonth = "6";
			break;
		case "july":
			correctMonth = "7";
			break;
		case "august":
			correctMonth = "8";
			break;
		case "september":
			correctMonth = "9";
			break;
		case "october":
			correctMonth = "10";
			break;
		case "november":
			correctMonth = "11";
			break;
		case "december":
			correctMonth = "12";
			break;
	}
	
	return correctMonth;
};

/* ------ Helper Functions ------ */
exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        InProgressRecommendationIntent,
        InProgressLogFoodIntent,
		InProgressGetMealIntent,
        CompletedRecommendationIntent,
        CompletedLogFoodIntent,
		CompletedGetMealIntent,
        HelpHandler,
        ExitHandler,
        FallbackHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();