SRC_DIR := src
TEST_DIR := test
OUT_DIR := out
CLASSES := $(OUT_DIR)/classes
TEST_CLASSES := $(OUT_DIR)/test-classes

LIB_DIR := lib
JUNIT_VERSION := 1.10.3
JUNIT_JAR := $(LIB_DIR)/junit-platform-console-standalone-$(JUNIT_VERSION).jar
JUNIT_URL := https://repo1.maven.org/maven2/org/junit/platform/junit-platform-console-standalone/$(JUNIT_VERSION)/junit-platform-console-standalone-$(JUNIT_VERSION).jar

.PHONY: build test run clean

build:
	mkdir -p $(CLASSES)
	javac -d $(CLASSES) $(SRC_DIR)/*.java

$(JUNIT_JAR):
	mkdir -p $(LIB_DIR)
	curl -sL -o $(JUNIT_JAR) $(JUNIT_URL)

test: build $(JUNIT_JAR)
	mkdir -p $(TEST_CLASSES)
	javac -cp "$(CLASSES):$(JUNIT_JAR)" -d $(TEST_CLASSES) $(TEST_DIR)/*.java
	java -jar $(JUNIT_JAR) execute -cp "$(CLASSES):$(TEST_CLASSES)" --scan-classpath --details=tree

run: build
	java -cp $(CLASSES) Main

clean:
	rm -rf $(OUT_DIR)
