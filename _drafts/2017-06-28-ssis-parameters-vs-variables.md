---
title:    SSIS Parameters vs. Variables
layout:   post
date:     2017-06-28
---

In many ways, SSIS parameters and variables operate the same way.

## Parameters

- Values can be set externally (e.g. SSMS).
- Values cannot change during package execution.
- Cannot be manipulated by an expression.

If you expect the value to change from one deployment to another (i.e. running in Visual Studio is different from running on localhost is different from QA and production), then use a parameter. You will be able to change values in SSMS.

## Variables

- Values cannot be set externally.
- Values can change during package execution.
- Can be manipulated by an expression.

If the value is local to the package, then you should use a variable.
